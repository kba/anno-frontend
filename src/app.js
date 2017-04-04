// npmjs modules
var Vue     = require('vue')
// var $       = require('jquery')
var tinymce = require('tinymce')
var Base64  = require('js-base64')
var Cookies = require('js-cookie')

// local modules
var l10n       = require('./l10n')
var config     = require('./config')
var CoordUtils = require('./coord-utils')


// HTML
// var annoColTemplate      = require('../template/annoCol.html')
// var versionTemplate      = require('../template/version.html')

var zoneeditdrawing;
// var thumbTimeout;

const commentsComponent = require('./components/comments.js')
const ZoneEditorComponent = require('./components/zone-editor.js')

class UBHDAnnoApp {

    static get config() { return config; }

    /**
     * @param {String} target: ID des Annotationen-Targets, für das die zugehörigen Annotationen ausgegeben werden soll
     * @param {Object} options:
     * @param {String} options.htmlid ID des HTML-Elements, in dem die Liste der Annotationen ausgegeben werden soll
     * @param {String} options.service: Dienst, für den die Annotationen verwaltet werden (z.B. "diglit", zukünftig mit zu target)
     * @param {String} options.ubdannoprefix: Präfix für verwendete CSS-Klassen und IDs
     * @param {String} options.sort: Sortierung: date, datereverse, title
     * @param {String} options.lang: Sprache: de, en
     * @param {String} options.no_oai: Keine Ausgabe von IIIF-URLs (ggf. umbenennen)
     * @param {String} options.edit_img_url: Editor: URL zu Image, für das Polygone erstellt werden
     * @param {String} options.edit_img_width: Editor: Breite des Images, für das Zonen erstellt werden, in Pixel
     * @param {String} options.edit_img_thumb: Editor: URL zu Thumb-Image (Orientierungsthumb im Editor)
     * @param {String} options.highlight: Closure / Funktion für das Highlighting der Zonen. Signatur: (annotations,active,csspraefix,displayopt)
     * @param {String} options.iiif_url: URL-Anfang für die IIIF-URL (Zonenausschnitt)
     * @param {String} options.iiif_img_width: TODO: raus aus Optionen, muss automatisch ermittelt werden (Zones)
     * @param {String} options.iiif_img_height: TODO: raus aus Optionen, muss automatisch ermittelt werden (Zones)
     * @param {String} options.gotopurl: ID der Annotation, die hervorgehoben werden soll, weil der Dienst über die persistente URL der Annotatione aufgerufen wurde
     * @param {String} options.purl: URL-Anfang für die persistenten URLs zu der Annotationen
     * @param {String} options.login: URL für Login-Button in Annotationenanzeige
     * @param {String} options.readtoken: Read-Token für Annotationenservice
     * @param {String} options.writetoken: Write-Token für Annotationenservice
     */
    constructor(options={}) {

        options.prefix    = (options.prefix    || 'ubhdanno')
        options.sort      = (options.sort      || 'date')
        options.lang      = (options.lang      || 'en')
        options.highlight = (options.highlight || function() { console.log("No 'highlight' fn for args", arguments) })
        if (!options.htmlid)
            throw new Error("Must pass 'htmlid' option")

        this.options = options

        this.l10n = {};
        for (let k in config.texts) {
            var v = config.texts[k]
            this.l10n[v] = l10n(options.lang, v);
        }

        //
        // TODO TODO
        //
        const annotations = [];

        var htmltarget = `#${this.options.htmlid}`;
        // TODO XXX
        // $(htmltarget).html(`<div id="ubhdannoApp">${annoColTemplate}</div>`);

        var app = new Vue({
            el: '#ubhdannoApp',
            data: {
                text: this.l10n,
                annotations: annotations,
                options: this.options,
                prefix: this.prefix,
                annoservicehosturl: config.annoservicehosturl,
                zoneedit: (this.options.edit_img_url !== undefined && this.options.edit_img_width !== undefined),
            },
            computed: {
                annotations_sorted: () => {
                    var items = annotations;
                    if (this.options.sort) {
                        items.sort((a, b) => {
                            if (this.options.sort === 'date') 
                                return ((a.jcr_modified < b.jcr_modified) ? -1 : ((a.jcr_modified > b.jcr_modified) ? 1 : 0))
                            else if (this.options.sort == 'date.reverse')
                                return ((a.jcr_modified < b.jcr_modified) ? 1 : ((a.jcr_modified > b.jcr_modified) ? -1 : 0))
                            else
                                return ((a.title < b.title) ? -1 : ((a.title > b.title) ? 1 : 0))
                        })
                    }
                    return items;
                }
            },
        });

    }

    displayAnnotations(htmlid, annotarget) {

        var self = this;
        var prefix = this.prefix;
        var htmltarget = `#${this.options.htmlid}`;
        var annotations = this.getAnnotations(annotarget);

        //  Annotation, die ueber PURL addressiert wurde, hervorheben
        if (this.options.gotopurl) $('#'+this.options.gotopurl).addClass(`${prefix}PURL`)

        //  Zone-Editor
        if (this.options.edit_img_url && this.options.edit_img_width) {
            const zoneEditorComponent = create({
                text: this.l10n,
                options: this.options,
                annoservicehosturl: config.annoservicehosturl,
                prefix: this.prefix,
            })
            this.createZoneEditor()
        }

        //  Sortierung
        $(htmltarget+' .'+prefix+'sortdate').on('click', () => { 
            this.options.sort = 'date'
            this.displayAnnotations(htmlid, annotarget)
        })
        $(htmltarget+' .'+prefix+'sortdatereverse').on('click', () => {
            this.options.sort = 'date.reverse'
            this.displayAnnotations(htmlid, annotarget) 
        })
        $(htmltarget+' .'+prefix+'sorttitle').on('click', () => {
            this.options.sort = 'title';
            this.displayAnnotations(htmlid, annotarget)
        });


        this.addClickHandlers()
        this.callHighlight();

        $(document).on('focusin', function(e) {
            if ($(e.target).closest(".mce-window").length) {
                e.stopImmediatePropagation();
            }
        });

    }


    addClickHandlers() {

        var self = this;
        var prefix = this.prefix;
        var htmlid = this.options.htmlid;
        var htmltarget = `#${this.options.htmlid}`;

        //  Dropdown Bildbezuege setzen
        if (Cookies !== undefined && Cookies.get('showref')) {
            $(`${htmltarget} .${prefix}showrefstatus`).hide();
            $(`${htmltarget} .${prefix}showrefstatus_${Cookies.get('showref')}`).show();
        }

        //  Mouseover Annotation ...
        $(htmltarget+' .'+prefix+'item').hover(
            function() {
                self.setAnnotationStatus($(this).attr('id'), true, prefix);
                self.callHighlight($(this).attr('id'));
            },
            function () {
                self.setAnnotationStatus($(this).attr('id'), false, prefix);
                self.callHighlight();
            }
        );

        //  Mouseover Kommentar
        $(htmltarget+' .'+prefix+'comment > div:first-child').hover(
            function () {
                self.setAnnotationStatus($(this).parent().attr('id'), true);
                self.callHighlight();
            },
            function () {
                self.setAnnotationStatus($(this).parent().attr('id'), false);
                self.callHighlight();
            }
        );

        //  Klick-Event Bildbezüge Dropdown
        $(htmltarget+' .'+prefix+'showrefopt li a').on('click', function() {
            var opt = $(this).attr('data-anno-showref');
            Cookies.set('showref', opt);
            $(htmltarget+' span.'+prefix+'showrefstatus').hide();
            $(htmltarget+' span.'+prefix+'showrefstatus_'+opt).show();
        });

        //  Wenn Annotation zugeklappt...
        $(htmltarget+' .collapse').on('hide.bs.collapse', function() {
            var i = $(this).attr('id').substr(5);
            $(`#${prefix}head_${i}`)
                .find('span.glyphicon-chevron-down')
                .removeClass('glyphicon-chevron-down')
                .addClass('glyphicon-chevron-right');
            var no_open = 0;
            var no_close = 0;
            $(htmltarget+' .collapse').each(function () {
                if ($(this).hasClass('in')) {no_open++}
                else {no_close++}
            });
            if (!no_open) {
                $(htmltarget+' .'+prefix+'closeall').addClass('hidden');
                $(htmltarget+' .'+prefix+'openall').removeClass('hidden');
            }
        });
        $(htmltarget+' .collapse').on('hidden.bs.collapse', function() {
            var no_open = 0;
            var no_close = 0;
            $(htmltarget+' .collapse').each(function () {
                if ($(this).hasClass('in')) {no_open++}
                else {no_close++}
            });
            if (!no_open) {
                $(htmltarget+' .'+prefix+'closeall').addClass('hidden');
                $(htmltarget+' .'+prefix+'openall').removeClass('hidden');
            }
        });

        //  Wenn Annotation aufgeklappt ...
        $(htmltarget+' .collapse').on('show.bs.collapse', function() {
            var i = $(this).attr('id').substr(5);
            $('#'+prefix+'head_'+i)
                .find('span.glyphicon-chevron-right')
                .removeClass('glyphicon-chevron-right')
                .addClass('glyphicon-chevron-down');
            $(this)
                .find('.'+prefix+'_old_version')
                .css('display', 'none');
        });
        $(htmltarget+' .collapse').on('shown.bs.collapse', function() {
            var no_open = 0;
            var no_close = 0;
            $(htmltarget+' .collapse').each(function () {
                if ($(this).hasClass('in')) {no_open++}
                else {no_close++}
            });
            if (no_close === 0) {
                $(htmltarget+' .'+prefix+'openall').addClass('hidden');
                $(htmltarget+' .'+prefix+'closeall').removeClass('hidden');
            }
        });


        //  PURL-Popover
        $(htmltarget+' .'+prefix+'purlbut').popover({
            title: this.popover_title(l10n(this.options.lang, 'purl')),
            html: true,
            placement: 'left'
        });

        //  Alle öffnen, Alle Schließen setzen
        $(htmltarget+' .collapse').eq(0).collapse('show');
        $(htmltarget+' .'+prefix+'closeall').on('click', function() {
            $(htmltarget+' .'+prefix+'closeall').addClass('hidden');
            $(htmltarget+' .'+prefix+'openall').removeClass('hidden');
            $(htmltarget+' .collapse').collapse('hide');
        });
        $(htmltarget+' .'+prefix+'openall').on('click', function() {
            $(htmltarget+' .'+prefix+'openall').addClass('hidden');
            $(htmltarget+' .'+prefix+'closeall').removeClass('hidden');
            $(htmltarget+' .collapse').collapse('show');
        });


        //  Speichern im Editor
        // $('#'+prefix+'_modal_edit .'+prefix+'savebut').on('click', function() {
        //     console.log($('#'+prefix+'_field_id').val())
        //     var ok = 1;
        //     //    Pflichtfelder ausgefüllt?
        //     $.each(config.fields, function (k, v) {
        //         if (typeof($('#'+prefix+'_field_'+k).attr('required')) != 'undefined' && !$('#'+prefix+'_field_'+k).val()) {
        //             $('#'+prefix+'_field_'+k).closest('.form-group').addClass('has-error');
        //             ok = 0;
        //         }
        //     });
        //     if (ok) {
        //         if (typeof(options.edit_img_url) != 'undefined' && typeof(options.edit_img_width) != 'undefined') {
        //             //        Wenn Zoneneditor aufgerufen wurde...
        //             if (typeof zoneeditdrawing != 'undefined') {
        //                 var shapes = zoneeditdrawing.getLayerShape().getShapes();
        //                 var new_svg_polygon = '';
        //                 for (var i = 0; i < shapes.length; i++) {
        //                     var c = ''
        //                     var polygonnew = CoordUtils.coordAbs2Rel(shapes[i].getCoords(), options.edit_img_width);
        //                     for (var j = 0; j < polygonnew.length; j++) {
        //                         if (j > 0) {c += ', '}
        //                         c += JSON.stringify(polygonnew[j]);
        //                     }
        //                     if (c) {new_svg_polygon += c + '<end>';}
        //                 }
        //                 $('#'+prefix+'_field_polygon').val(new_svg_polygon);
        //             }
        //         }




        //         // TODO





        //         $('#'+prefix+'_modal_edit').modal('hide');
        //     }
        // });

        // //  Version ausgewählt
        // $(htmltarget+' .'+prefix+'versions a').on('click', function() {
        //     var annoid = $(this).closest('.'+prefix+'item').attr('id');
        //     var anno = getAnnotation(annotations, annoid);
        //     var searchid = $(this).attr('data-versionid');
        //     var ver = getVersion(anno, $(this).attr('data-versionid'));
        //     if (typeof(ver) != 'undefined') {
        //         ver.content = getVersionContent(annotarget, annoid, ver, options);
        //         anno.shown_version = $(this).attr('data-versionid');
        //         anno.shown_version_polygons = ver.content.svg_polygon;
        //     }

        //     $('#old_version_'+annoid).html(versionTemplate);

        //     var app = new Vue({
        //         el: '#old_version_'+annoid,
        //         data: {
        //             text: t,
        //             item: ver.content,
        //             //        Zur Schreibvereinfachung prefix nochmal separat...
        //             prefix: prefix,
        //             created_display: ver.created_display,
        //         }
        //     });

        //     $('#old_version_'+annoid).prefix('display', 'block');
        //     self.callHighlight(annoid);
        //     $(htmltarget+' .'+prefix+'versclosebut').on('click', function() {
        //         $(this).closest('.'+prefix+'_old_version').prefix('display', 'none');
        //         delete anno['shown_version'];
        //         delete anno['shown_version_polygons'];
        //         self.callHighlight();
        //     });
        // });

        // //  Neue Annotation
        // $(htmltarget+' .'+prefix+'new').on('click', function() {
        //     //    Felder leeren
        //     $.each(config.fields, function (k, v) {
        //         if (k != 'text') {
        //             $('#'+prefix+'_field_'+k).val('');
        //         }
        //     });
        //     $('#'+prefix+'_field_parent').val(annotarget);
        //     initHTMLEditor('#'+prefix+'_modal_edit form textarea', 'de', '');
        //     $('#'+prefix+'_modal_edit .modal-body .nav-tabs a:first').tab('show');
        //     $('#'+prefix+'_modal_edit').modal('toggle');
        // });

        // //  Kommentar
        // $(htmltarget+' .'+prefix+'commentbut').on('click', function() {
        //     //    Felder leeren
        //     $.each(config.fields, function (k, v) {
        //         if (k != 'text') {
        //             $('#'+prefix+'_field_'+k).val('');
        //         }
        //     });
        //     initHTMLEditor('#'+prefix+'_modal_edit form textarea', 'de', '');
        //     var commentonanno = getAnnotation(annotations, $(this).closest('.'+prefix+'item, .'+prefix+'comment').attr('id'));
        //     $('#'+prefix+'_field_parent').val(commentonanno.svname);
        //     $('#'+prefix+'_modal_edit .modal-body .nav-tabs a:first').tab('show');
        //     $('#'+prefix+'_modal_edit').modal('toggle');
        // });

        // //   Annotation editieren
        // $(htmltarget+' .'+prefix+'editbut').on('click', function() {
        //     //    Felder vorausfüllen
        //     var editanno = getAnnotation(annotations, $(this).closest('.'+prefix+'item, .'+prefix+'comment').attr('id'));
        //     $.each(config.fields, function (k, v) {
        //         if (k != 'text') {
        //             $('#'+prefix+'_field_'+k).val(editanno[v]);
        //         }
        //     });
        //     $('#'+prefix+'_field_id').val(editanno.id);
        //     if (typeof(editanno.parent_svname) != 'undefined') {
        //         $('#'+prefix+'_field_parent').val(editanno.parent_svname);
        //     }
        //     else {
        //         $('#'+prefix+'_field_parent').val(annotarget);
        //     }
        //     initHTMLEditor('#'+prefix+'_modal_edit form textarea', 'de', editanno.text);
        //     $('#'+prefix+'_modal_edit .modal-body .nav-tabs a:first').tab('show');
        //     $('#'+prefix+'_modal_edit').modal('toggle');
        // });
    }


    initHTMLEditor (selector, language, content) {
        $(selector).val(content);
        var ed = tinymce.editors;
        if (ed.length) {
            ed[0].setContent(content);
        }
        tinymce.init({
            selector: selector,
            plugins: 'image link',
            language: language,
            toolbar: [
                'undo redo',
                'formatselect',
                'bold italic underline blockquote',
                'alignleft aligncenter alignright',
                'bullist numlist indent outdent',
                'link image',
            ].join('|'),
            menubar: false,
            statusbar: false,
            height: 400,
            width: 350,
        });
        Object.keys(config.tinymce_localizations).forEach(function(lang) {
            tinymce.addI18n(lang, config.tinymce_localizations[lang]);
        });
    }

    // getAnnotation(annotations, annoid) {
    //     var single_annotation = {};
    //     var gef = 0;
    //     $.each(annotations, function (k, v) {
    //         if (!gef && v.id == annoid) {
    //             single_annotation = v;
    //             gef = 1;
    //         }
    //         if (!gef && v.hasChildren) {
    //             single_annotation = getAnnotation(v.children, annoid);
    //             if (typeof(single_annotation.id) != 'undefined') {gef = 1}
    //         }
    //     });
    //     return single_annotation;
    // }

    // getVersion(annotation, versionid) {
    //     var single_version = {};
    //     $.each(annotation.versions, function (k, v) {
    //         if (v.idshort == versionid) {
    //             single_version = v;
    //         }
    //     });
    //     return single_version;
    // }

    getAnnotations(annotarget) {
        return []
//         var annotations = [];
//         var tokens = '';
//         if (typeof(options.readtoken) != 'undefined' && options.readtoken.length) {tokens += '&rtok='+options.readtoken}
//         if (typeof(options.writetoken) != 'undefined' && options.writetoken.length) {tokens += '&wtok='+options.writetoken}
//         $.ajax({
//             dataType: 'xml',
//             url: 'http://digi.ub.uni-heidelberg.de/annotations?forward='+annotarget+'/fcr:export?recurse=true&skipBinary=false',
//             // neu:
//             //    url: config.annoserviceurl+'?service='+options.service+'&target='+annotarget+tokens,
//             async: false,
//         }).done(function (annoxml) {
//             //    var data = xmlToJson($.parseXML(annoxml));
//             if (annoxml !== null) {
//                 var data = xmlToJson(annoxml);
//                 if (typeof(data['sv:node']) != 'undefined') {
//                     var data1 = data['sv:node'];
//                     $.each(data1['sv:property'], function (ky, val) {
//                         var a = val['@attributes'];
//                         if (a["sv:name"] == 'user_rights') {
//                             if (val['sv:value']['#text'] == 'comment') {



//                             }
//                         }
//                     });
//                     if (typeof(data1['sv:node']) != 'undefined') {
//                         convertTree(annotations, data1['sv:node'], annotarget, annotarget, options);
//                     }
//                     else {
//                         console.log('Error in reading data', data1)
//                     }
//                 }
//             }
//         });
//         return annotations;
    }

//     getVersionContent(annotarget, annoidentifier, vers, options) {
//         var versionid = vers.idshort;
//         var result = {};
//         var version = {};
//         $.ajax({
//             accepts: {
//                 jsonld: 'application/ld+json'
//             },
//             converters: {
//                 'text jsonld': function(result) {
//                     return JSON.parse(result);
//                 }
//             },
//             dataType: 'jsonld',
//             url: 'http://digi.ub.uni-heidelberg.de/annotations?forward='+annotarget+'/'+annoidentifier+'/fcr:versions/'+versionid+'/',
//             // neu:
//             //      url: config.annoserviceurl+'?service='+options.service+'&target='+annotarget+'/'+annoidentifier+'/fcr:versions/'+versionid+'/',
//             async: false,
//         }).done(function (data) {
//             //  ???
//             if (typeof(data[0]['http://purl.org/dc/elements/1.1/title']) != 'undefined') {result = data[0]}
//             else {result = data[1]}
//         });
//         if (typeof(result) != 'undefined') {
//             if (typeof(result['http://purl.org/dc/elements/1.1/title']) != 'undefined') {
//                 version.title = result['http://purl.org/dc/elements/1.1/title'][0]['@value'];
//             }
//             if (typeof(result['http://purl.org/dc/elements/1.1/description-ger']) != 'undefined') {
//                 version.text = result['http://purl.org/dc/elements/1.1/description-ger'][0]['@value'];
//             }
//             if (typeof(result['http://purl.org/dc/elements/1.1/source']) != 'undefined') {
//                 version.link = result['http://purl.org/dc/elements/1.1/source'][0]['@value'];
//             }
//             else {version.link = ''}
//             if (typeof(result['http://www.w3.org/2000/svg#polygon']) != 'undefined') {
//                 for (var nr in result['http://www.w3.org/2000/svg#polygon']) {
//                     version.svg_polygon = result['http://www.w3.org/2000/svg#polygon'][nr]['@value'] + '<end>';
//                 }
//             }
//             if (vers["http://fedora.info/definitions/v4/repository#created"][0]['@value']) {
//                 version.date = vers["http://fedora.info/definitions/v4/repository#created"][0]['@value'];
//             }
//         }
//         else {
//             version.text = 'kein Annotationen vorhanden';
//         }
//         version.annotation_identifier = annoidentifier;

//         return version;
//     }


//     getVersions(anno, annotarget, options) {
//         if (anno.versioned && !anno.versions_loaded) {
//             $.ajax({
//                 accepts: {
//                     jsonld: 'application/ld+json'
//                 },
//                 converters: {
//                     'text jsonld': function(result) {
//                         return JSON.parse(result);
//                     }
//                 },
//                 dataType: 'jsonld',
//                 url: 'http://digi.ub.uni-heidelberg.de/annotations?forward='+annotarget+'/'+anno.id+'/fcr:versions',
//                 // neu:
//                 //      url: config.annoserviceurl+'?service='+options.service+'&target='+annotarget+'/'+anno.id+'/fcr:versions',
//                 async: false,
//             }).done(function (versionjson) {
//                 if (typeof(versionjson) == 'object') {
//                     var sort_text = "http://fedora.info/definitions/v4/repository#created";
//                     versionjson = versionjson.splice(1, versionjson.length);
//                     anno.versions = versionjson.sort(function(a, b) {
//                         if (a[sort_text][0]['@value'] < b[sort_text][0]['@value']) return 1;
//                         if (a[sort_text][0]['@value'] > b[sort_text][0]['@value']) return -1;
//                         return 0;
//                     });
//                     $.each(anno.versions, function (k, v) {
//                         v.created_display = convertDate(v[sort_text][0]['@value']);
//                         v.idshort = v['@id'].split('/')[v['@id'].split('/').length-1];
//                     });
//                 }
//             });
//         }
//         anno.versions_loaded = true;
//     }

//     base64Decode(typ, s){
//         if (typ=== 'Binary') {
//             if (typeof s === 'object'){
//                 var out='';
//                 for (var i in s) {
//                     out += Base64.decode(s[i]);
//                 }
//                 return out;
//             }
//             else {
//                 return Base64.decode(s);
//             }
//         } else {
//             return s
//         }
//     }

//     xmlToJson(xml) {
//         var attr,
//             child,
//             attrs = xml.attributes,
//             children = xml.childNodes,
//             key = xml.nodeType,
//             obj = {},
//             i = -1;

//         if (key === 1 && attrs.length) {
//             obj[key = '@attributes'] = {};
//             while ((attr = attrs.item(++i))) {
//                 obj[key][attr.nodeName] = attr.value;
//             }
//             i = -1;
//         } else if (key === 3) {
//             obj = xml.nodeValue;
//         }
//         while ((child = children.item(++i))) {
//             key = child.nodeName;
//             if (obj.hasOwnProperty(key)) {
//                 if (obj.toString.call(obj[key]) !== '[object Array]') {
//                     obj[key] = [obj[key]];
//                 }
//                 obj[key].push(xmlToJson(child));
//             }
//             else {
//                 obj[key] = xmlToJson(child);
//             }
//         }
//         return obj;
//     }

//     convertProperties(prop, properties, parent_string, options) {
//         var anno = {};
//         [>  if (prop['@attributes']) {
//     anno.identifier = prop['@attributes']['sv:name'];
// console.log('anno.identifier: '+anno.identifier);
//   } */
//         if (properties['sv:name']) {
//             anno.id = properties['sv:name'];
//         }
//         anno.iiif_url = '';
//         anno.editable = false;
//         anno.commentable = false;
//         anno.hasChildren = false;
//         anno.hasComment = false;
//         anno.versions_loaded = false;
//         anno.versions = [];
//         $.each(prop, function (ky, val) {
//             var a = val['@attributes'];
//             var p ;
//             if (typeof(val['sv:value']) != 'undefined' && typeof(val['sv:value']['#text']) != 'undefined') {
//                 p =base64Decode(a['sv:type'], val['sv:value']['#text']);

//             }

//             if (a["sv:name"] == 'svg:polygon') {
//                 anno.hasZones = 1;
//             }

//             $.each(config.typeList, function (k, v) {
//                 if (a["sv:name"] === k) {
//                     var strn = "anno." + v;
//                     if (typeof(val['sv:value']) != 'undefined') {
//                         if (typeof(val['sv:value']['#text']) == 'undefined') {
//                             var temp = "";
//                             $.each(val['sv:value'], function (key, value) {
//                                 if (typeof(value['#text']) != 'undefined') {
//                                     temp += base64Decode(a['sv:type'], value['#text']) + '<end>';
//                                 }
//                             });
//                             anno[v] = temp;
//                         }
//                         else {
//                             anno[v] = p;
//                         }
//                     }
//                 }
//             });
//         });

//         if (typeof(anno.user_rights) != 'undefined') {
//             if (anno.user_rights == 'edit') {
//                 anno.editable = true;
//                 anno.commentable = true;
//             }
//             if (anno.user_rights == 'comment') {
//                 anno.commentable = true;
//             }
//         }

//         if (typeof(properties) != 'undefined') {
//             anno.svname = parent_string + '/' + properties['sv:name'];
//             anno.clean_svname = properties['sv:name'];
//         }

//         if (typeof(anno.user_name) == 'undefined' || anno.user_name === '') {
//             anno.user_name = anno.account;
//         }
//         if (typeof(anno.jcr_modified) != 'undefined' && anno.jcr_modified !== '') {
//             anno.jcr_modified_display = convertDate(anno.jcr_modified);
//         }

//         // IIIF-URL ergaenzen (temporaer, bis eigenes Target)
//         if (anno.hasZones && typeof(options.iiif_url) != 'undefined' && typeof(options.iiif_img_width) != 'undefined' && typeof(options.iiif_img_height) != 'undefined' && options.iiif_url.length) {
//             var allpolygons = [];
//             if (typeof(anno.svg_polygon) != 'undefined') {
//                 var polygons = anno.svg_polygon.split('<end>');
//                 $.each(polygons, function (key, value) {
//                     if (value.length > 0 && typeof(value) != 'undefined' && value !== 'undefined') {
//                         allpolygons.push(JSON.parse('[' + value + ']'));
//                     }
//                 });
//             }
//             if (allpolygons.length) {
//                 anno.iiif_url = options.iiif_url + CoordUtils.anno_coordIIIF(allpolygons, options.iiif_img_width, options.iiif_img_height) + '/full/0/default.jpg';
//             }
//         }

//         return anno;
//     }

//     convertTree(toAdd, data1, parent_string, annotarget, options) {
//         if ($.isArray(data1) === false) {
//             var elem = convertProperties(data1['sv:property'], data1['@attributes'], parent_string, options);
//             var element_position = toAdd.push(elem);
//             if (toAdd.versioned !== null) {
//                 getVersions(toAdd, annotarget, options);
//             }
//             var child = data1['sv:node'];
//             var pos = element_position - 1;
//             if (child) {
//                 toAdd[pos].children = [];
//                 convertTree(toAdd[pos].children, child, elem.svname, annotarget, options);
//                 toAdd[pos].hasChildren = true;
//                 if (toAdd[pos].children[0].type == 'comment') {toAdd[pos].hasComment = true}
//                 for(var i = 0; i < toAdd[pos].children.length; i++) {
//                     toAdd[pos].children[i]['parent_svname'] = toAdd[pos].svname;
//                 }
//             }
//         }
//         else {
//             $.each(data1, function (key, value) {
//                 if (value['sv:property']) {
//                     var elem = convertProperties(value['sv:property'], value['@attributes'], parent_string, options);
//                     var element_position = toAdd.push(elem);
//                     var pos = element_position - 1;
//                     if (toAdd[key].versioned !== null) {
//                         getVersions(toAdd[key], annotarget, options);
//                     }
//                     var child = value['sv:node'];
//                     if (child) {
//                         toAdd[pos].children = [];
//                         convertTree(toAdd[pos].children, child, elem.svname, annotarget, options);
//                         toAdd[pos].hasChildren = true;
//                         if (toAdd[pos].children[0].type == 'comment') {toAdd[pos].hasComment = true}
//                         for(var i = 0; i < toAdd[pos].children.length; i++) {
//                             toAdd[pos].children[i]['parent_svname'] = toAdd[pos].svname;
//                         }
//                     }
//                 }
//             });
//         }
//     }


    /*
     * CSS HELPERS
     *
     */

    popover_title(title) {
        return `
            <span class="text-info">${title}</span>
            &nbsp;&nbsp;
            <button type="button" id="close" class="close" onclick="$('.popover').popover('hide');">&times;</button>'
          `
    }

    setAnnotationStatus(id, status) {
        $('#'+id)[status ? 'addClass' : 'removeClass'](`${this.prefix}status-active`);
    }


    // Callback? why callback isn't it just a function name?
    // TODO why the exception
    callHighlight(active) {
        // Liste der Annotationen
        // Liste der aktiven Annotationen und Kommentare(IDs) Hash mit Stufe als Value?
        // Versions-Polygon
        var fn = (this.options.highlight || function() {})
        // signature of which fn is this?
        fn(this.annotations, active, this.prefix, Cookies.get('showref'));
    }

    // convertDate(datestring, loc) {
    //     var dateObj = new Date(datestring);
    //     return dateObj.toLocaleString();
    // }


    anno_toggle_iiif (context) {
        context.parent().find('div').toggle();
        if (context.parent().find('div').ubdannoprefix('display') == 'none') {
            context.find('span').removeClass('fa-caret-down');
            context.find('span').addClass('fa-caret-right');
        }
        else {
            context.find('span').removeClass('fa-caret-right');
            context.find('span').addClass('fa-caret-down');
        }
    }


}

module.exports = UBHDAnnoApp;
