// npmjs modules
var Vue     = require('vue')
var $       = require('jquery')
var tinymce = require('tinymce')
var Base64  = require('js-base64')
var Cookies = require('js-cookie')

// local modules
var l10n       = require('./l10n')
var config     = require('./config')
var CoordUtils = require('./coord-utils')
var AnnoClient = require('./anno-client')

// HTML
var annoColTemplate      = require('../html/annoCol.vue.html')
var versionTemplate      = require('../html/version.vue.html')
var zoneEditTemplate     = require('../html/zoneEdit.vue.html')
var annoCommentsTemplate = require('../html/comments.vue.html')

var zoneeditdrawing;
var zoneeditthumb;

var thumbTimeout;

/**
 * @param {String} htmlid ID des HTML-Elements, in dem die Liste der Annotationen ausgegeben werden soll
 * @param {String} target: ID des Annotationen-Targets, für das die zugehörigen Annotationen ausgegeben werden soll
 * @param {Object} options:
 * @param {String} options.service: Dienst, für den die Annotationen verwaltet werden (z.B. "diglit", zukünftig mit zu target)
 * @param {String} options.css: Präfix für verwendete CSS-Klassen und IDs
 * @param {String} options.sort: Sortierung: date, datereverse, title
 * @param {String} options.lang: Sprache: de, en
 * @param {String} options.no_oai: Keine Ausgabe von IIIF-URLs (ggf. umbenennen)
 * @param {String} options.edit_img_url: Editor: URL zu Image, für das Polygone erstellt werden
 * @param {String} options.edit_img_width: Editor: Breite des Images, für das Zonen erstellt werden, in Pixel
 * @param {String} options.edit_img_thumb: Editor: URL zu Thumb-Image (Orientierungsthumb im Editor)
 * @param {String} options.highlight: Callback Funktion für das Highlighting der Zonen
 * @param {String} options.iiif_url: URL-Anfang für die IIIF-URL (Zonenausschnitt)
 * @param {String} options.iiif_img_width: TODO: raus aus Optionen, muss automatisch ermittelt werden (Zones)
 * @param {String} options.iiif_img_height: TODO: raus aus Optionen, muss automatisch ermittelt werden (Zones)
 * @param {String} options.gotopurl: ID der Annotation, die hervorgehoben werden soll, weil der Dienst über die persistente URL der Annotatione aufgerufen wurde
 * @param {String} options.purl: URL-Anfang für die persistenten URLs zu der Annotationen
 * @param {String} options.login: URL für Login-Button in Annotationenanzeige
 * @param {String} options.readtoken: Read-Token für Annotationenservice
 * @param {String} options.writetoken: Write-Token für Annotationenservice
*/
function displayAnnotations(htmlid,annotarget,options) {
    var htmltarget = '#'+htmlid;
    var annotations = getAnnotations(annotarget,options);
    if (typeof(options['css']) == 'undefined') {options['css'] = 'anno'}
    var css = options['css'];
    if (typeof(options['sort']) == 'undefined') {options['sort'] = 'date'}
    if (typeof(options['lang']) == 'undefined') {options['lang'] = 'en'}
    var t = {};
    for (let k in config.texts) {
        var v = config.texts[k]
        t[v] = l10n(options.lang, v);
    }

    var html = '<div id="vueapp">'+annoColTemplate+'</div>';
    $(htmltarget).html(html);

    Vue.component('annocomments', {
      props: ['anno','options','css'],
      template: annoCommentsTemplate,
    });

    var app = new Vue({
      el: '#vueapp',
      data: {
        text: t,
        annotations: annotations,
        options: options,
//      Zur Schreibvereinfachung css nochmal separat...
        css: css,
        annoservicehosturl: config.annoservicehosturl,
        zoneedit: (typeof(options.edit_img_url) != 'undefined' && typeof(options.edit_img_width) != 'undefined')?1:0,
      },
      computed: {
        annotations_sorted: function () {
          var items = annotations;
          if (typeof(options.sort) != 'undefined' && options.sort.length) {
            items.sort(function(a,b) {
              if (options.sort == 'date') {return ((a.jcr_modified < b.jcr_modified) ? -1 : ((a.jcr_modified > b.jcr_modified) ? 1 : 0))}
              else if (options.sort == 'date.reverse') {return ((a.jcr_modified < b.jcr_modified) ? 1 : ((a.jcr_modified > b.jcr_modified) ? -1 : 0))}
              else {
                return ((a.title < b.title) ? -1 : ((a.title > b.title) ? 1 : 0));
              }
            });
          }
          return items;
        }
      },
    });

//  Annotation, die ueber PURL addressiert wurde, hervorheben
    if (typeof(options.gotopurl) != 'undefined' && options.gotopurl.length) {
      $('#'+options.gotopurl).addClass(css+'PURL');
    }

//  Zone-Editor
    if (typeof(options.edit_img_url) != 'undefined' && typeof(options.edit_img_width) != 'undefined') {

      $('#'+css+'_tab_zones').html(zoneEditTemplate);

      var zoneapp = new Vue({
        el: '#'+css+'_tab_zones',
        data: {
          text: t,
          options: options,
          annoservicehosturl: config.annoservicehosturl,
//        Zur Schreibvereinfachung css nochmal separat...
          css: css,
        }
      });

      $('#'+css+'_zoneeditzoomout').on('click', function(){
        zoneeditdrawing.getViewbox().zoomOut();
        anno_navigationThumb(zoneeditthumb,zoneeditdrawing)
      });
      $('#'+css+'_zoneeditzoomin').on('click', function(){
        zoneeditdrawing.getViewbox().zoomIn();
        anno_navigationThumb(zoneeditthumb,zoneeditdrawing)
      });
      $('#'+css+'_zoneeditfittocanvas').on('click', function(){
        zoneeditdrawing.getViewbox().fit(true);
        zoneeditdrawing.getViewbox().setPosition(xrx.drawing.Orientation.NW);
        anno_navigationThumb(zoneeditthumb,zoneeditdrawing)
      });
      $('#'+css+'_zoneeditrotleft').on('click', function(){
        zoneeditdrawing.getViewbox().rotateLeft();
        zoneeditthumb.getViewbox().rotateLeft();
        anno_navigationThumb(zoneeditthumb,zoneeditdrawing)
      });
      $('#'+css+'_zoneeditrotright').on('click', function(){
        zoneeditdrawing.getViewbox().rotateRight();
        zoneeditthumb.getViewbox().rotateRight();
        anno_navigationThumb(zoneeditthumb,zoneeditdrawing)
      });
      $('#'+css+'_zoneeditpolygon').on('click', function(){
        var styleCreatable = new xrx.shape.Style();
        styleCreatable.setFillColor('#3B3BFF');
        styleCreatable.setFillOpacity(0.1);
        styleCreatable.setStrokeWidth(1);
        styleCreatable.setStrokeColor('#3B3BFF');
        var np = new xrx.shape.Polygon(zoneeditdrawing);
        np.setStyle(styleCreatable);
        np.getCreatable().setStyle(styleCreatable);
        zoneeditdrawing.setModeCreate(np.getCreatable());
        zoneeditdrawing.draw();
        $('#'+css+'_zoneedittoolbar button').removeClass('active');
        $('#'+css+'_zoneeditpolygon').addClass('active');
        $('#'+css+'_zoneeditdel').addClass('disabled');
      });
      $('#'+css+'_zoneeditrect').on('click', function(){
        var styleCreatable = new xrx.shape.Style();
        styleCreatable.setFillColor('#3B3BFF');
        styleCreatable.setFillOpacity(0.1);
        styleCreatable.setStrokeWidth(1);
        styleCreatable.setStrokeColor('#3B3BFF');
        var nr = new xrx.shape.Rect(zoneeditdrawing);
        nr.setStyle(styleCreatable);
        nr.getCreatable().setStyle(styleCreatable);
        zoneeditdrawing.setModeCreate(nr.getCreatable());
        zoneeditdrawing.draw();
        $('#'+css+'_zoneedittoolbar button').removeClass('active');
        $('#'+css+'_zoneeditrect').addClass('active');
        $('#'+css+'_zoneeditdel').addClass('disabled');
      });
      $('#'+css+'_zoneeditview').on('click', function(){
        zoneeditdrawing.setModeView();
        $('#'+css+'_zoneedittoolbar button').removeClass('active');
        $('#'+css+'_zoneeditview').addClass('active');
        $('#'+css+'_zoneeditdel').addClass('disabled');
      });
      $('#'+css+'_zoneeditmove').on('click', function(){
        zoneeditdrawing.setModeModify();
        $('#'+css+'_zoneedittoolbar button').removeClass('active');
        $('#'+css+'_zoneeditmove').addClass('active');
        $('#'+css+'_zoneeditdel').removeClass('disabled');
      });
      $('#'+css+'_zoneeditdel').on('click', function(){
        if (typeof(zoneeditdrawing.getSelectedShape()) == 'undefined') {
          alert("Please select a shape");
          return;
        }
        if (window.confirm("Delete selected shape?")) {
          zoneeditdrawing.removeShape(zoneeditdrawing.getSelectedShape());
        }
      });

      $('#'+css+'_but_zoneedit').on('click', function () {
        $('a[href="#'+css+'_tab_zones"').tab('show');
      });

//    Oeffnen Zone-Editor-Tab
      $('a[href="#'+css+'_tab_zones"').on('shown.bs.tab', function (e) {
        $('#'+css+'_zoneeditcanvas canvas').remove();
        $('#'+css+'_zoneeditthumb canvas').remove();
        $('#'+css+'_zoneeditcanvas').css('width',$('#'+css+'_zoneedittoolbar').innerWidth());
        zoneeditdrawing = new xrx.drawing.Drawing(goog.dom.getElement(css+'_zoneeditcanvas'));
        zoneeditdrawing.eventViewboxChange = function (x, y) {anno_navigationThumb(zoneeditthumb,zoneeditdrawing)}
        if (zoneeditdrawing.getEngine().isAvailable()) {
          zoneeditdrawing.setBackgroundImage(options.edit_img_url, function() {
            zoneeditdrawing.setModeView();
            zoneeditdrawing.getViewbox().fitToWidth(false);
            zoneeditdrawing.getViewbox().setZoomFactorMax(4);
            var z = $('#'+css+'_field_polygon').val();
            if (z.length > 0) {
              var p = z.split('<end>');
              var i;
              var shapes = [];
              for (i = 0; i < p.length; i++) {
                if (p[i]) {
                  var coords = CoordUtils.coordRel2Abs(JSON.parse('['+p[i]+']'),options.edit_img_width);
                  var shape;
                  if (CoordUtils.isRectangle(coords)) {
                    shape = new xrx.shape.Rect(zoneeditdrawing);
                  }
                  else {
                    shape = new xrx.shape.Polygon(zoneeditdrawing);
                  }
                  shape.setCoords(coords);
                  shape.setStrokeWidth(1);
                  shape.setStrokeColor('#A00000');
                  shape.setFillColor('#A00000');
                  shape.setFillOpacity(0.2);
                  shape.getSelectable().setFillColor('#000000');
                  shape.getSelectable().setFillOpacity(0.2);
                  shape.getSelectable().setStrokeWidth(3);
                  shapes.push(shape);
                }
              }
              zoneeditdrawing.getLayerShape().addShapes(shapes);
            }
            zoneeditdrawing.draw();
            if (typeof(options.edit_img_thumb) != 'undefined') {
              $('#'+css+'_zoneeditthumb').show();
              zoneeditthumb = new xrx.drawing.Drawing(goog.dom.getElement(css+'_zoneeditthumb'));
              if (zoneeditthumb.getEngine().isAvailable()) {
                zoneeditthumb.setBackgroundImage(options.edit_img_thumb, function() {
                  zoneeditthumb.setModeDisabled();
                  zoneeditthumb.getViewbox().fit(true);
                  zoneeditthumb.getViewbox().setPosition(xrx.drawing.Orientation.NW);
                  zoneeditthumb.draw();
                  anno_navigationThumb(zoneeditthumb,zoneeditdrawing)
                });
              }
            }
          });
        }
      });
    }

//  Dropdown Bildbezuege setzen
    if (typeof(Cookies) != 'undefined') {
      if (Cookies.get('showref')) {
        $(htmltarget+' .'+css+'showrefstatus').hide();
        $(htmltarget+' .'+css+'showrefstatus_'+Cookies.get('showref')).show();
      }
    }
//  Klick-Event Bildbezüge Dropdown
    $(htmltarget+' .'+css+'showrefopt li a').on('click', function() {
      var opt = $(this).attr('data-anno-showref');
      Cookies.set('showref',opt);
      $(htmltarget+' span.'+css+'showrefstatus').hide();
      $(htmltarget+' span.'+css+'showrefstatus_'+opt).show();
    });

//  Wenn Annotation zugeklappt...
    $(htmltarget+' .collapse').on('hide.bs.collapse', function() {
      var i = $(this).attr('id').substr(5);
      $('#'+css+'head_'+i).find('span.glyphicon-chevron-down').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-right');
      var no_open = 0;
      var no_close = 0;
      $(htmltarget+' .collapse').each(function () {
        if ($(this).hasClass('in')) {no_open++}
        else {no_close++}
      });
      if (!no_open) {
        $(htmltarget+' .'+css+'closeall').addClass('hidden');
        $(htmltarget+' .'+css+'openall').removeClass('hidden');
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
        $(htmltarget+' .'+css+'closeall').addClass('hidden');
        $(htmltarget+' .'+css+'openall').removeClass('hidden');
      }
    });

//  Wenn Anntation aufgeklappt ...
    $(htmltarget+' .collapse').on('show.bs.collapse', function() {
      var i = $(this).attr('id').substr(5);
      $('#'+css+'head_'+i).find('span.glyphicon-chevron-right').removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-down');
      $(this).find('.'+css+'_old_version').css('display','none');
    });
    $(htmltarget+' .collapse').on('shown.bs.collapse', function() {
      var no_open = 0;
      var no_close = 0;
      $(htmltarget+' .collapse').each(function () {
        if ($(this).hasClass('in')) {no_open++}
        else {no_close++}
      });
      if (no_close === 0) {
        $(htmltarget+' .'+css+'openall').addClass('hidden');
        $(htmltarget+' .'+css+'closeall').removeClass('hidden');
      }
    });

//  Mouseover Annotation ...
    $(htmltarget+' .'+css+'item').hover(
      function() {
        setAnnotationStatus($(this).attr('id'),true,css);
        callHighlight(options['highlight'],annotations,$(this).attr('id'),css);
      },
      function () {
        setAnnotationStatus($(this).attr('id'),false,css);
        callHighlight(options['highlight'],annotations,'',css);
      }
    );
//  Mouseover Kommentar
    $(htmltarget+' .'+css+'comment > div:first-child').hover(
      function() {
        setAnnotationStatus($(this).parent().attr('id'),true,css);
        callHighlight(options['highlight'],annotations,'',css);
      },
      function () {
        setAnnotationStatus($(this).parent().attr('id'),false,css);
        callHighlight(options['highlight'],annotations,'',css);
      }
    );

//  PURL-Popover
    $(htmltarget+' .'+css+'purlbut').popover({title: popover_title(l10n(options.lang,'purl')), html: true, placement: 'left'});


//  Alle öffnen, Alle Schließen setzen
    $(htmltarget+' .collapse').eq(0).collapse('show');
    $(htmltarget+' .'+css+'closeall').on('click', function() {
      $(htmltarget+' .'+css+'closeall').addClass('hidden');
      $(htmltarget+' .'+css+'openall').removeClass('hidden');
      $(htmltarget+' .collapse').collapse('hide');
    });
    $(htmltarget+' .'+css+'openall').on('click', function() {
      $(htmltarget+' .'+css+'openall').addClass('hidden');
      $(htmltarget+' .'+css+'closeall').removeClass('hidden');
      $(htmltarget+' .collapse').collapse('show');
    });

//  Sortierung
    $(htmltarget+' .'+css+'sortdate').on('click', function() {
      var optionsnew = options;
      optionsnew.sort = 'date';
      displayAnnotations(htmlid,annotarget,optionsnew)
    });
    $(htmltarget+' .'+css+'sortdatereverse').on('click', function() {
      var optionsnew = options;
      optionsnew.sort = 'datereverse';
      displayAnnotations(htmlid,annotarget,optionsnew)
    });
    $(htmltarget+' .'+css+'sorttitle').on('click', function() {
      var optionsnew = options;
      optionsnew.sort = 'title';
      displayAnnotations(htmlid,annotarget,optionsnew)
    });

//  Speichern im Editor
    $('#'+css+'_modal_edit .'+css+'savebut').on('click', function() {
      console.log($('#'+css+'_field_id').val())
      var ok = 1;
//    Pflichtfelder ausgefüllt?
      $.each(config.fields, function (k, v) {
        if (typeof($('#'+css+'_field_'+k).attr('required')) != 'undefined' && !$('#'+css+'_field_'+k).val()) {
          $('#'+css+'_field_'+k).closest('.form-group').addClass('has-error');
          ok = 0;
        }
      });
      if (ok) {
        if (typeof(options.edit_img_url) != 'undefined' && typeof(options.edit_img_width) != 'undefined') {
//        Wenn Zoneneditor aufgerufen wurde...
          if (typeof zoneeditdrawing != 'undefined') {
            var shapes = zoneeditdrawing.getLayerShape().getShapes();
            var new_svg_polygon = '';
            for (var i = 0; i < shapes.length; i++) {
              var c = ''
              var polygonnew = CoordUtils.coordAbs2Rel(shapes[i].getCoords(),options.edit_img_width);
              for (var j = 0; j < polygonnew.length; j++) {
                if (j > 0) {c += ','}
                c += JSON.stringify(polygonnew[j]);
              }
              if (c) {new_svg_polygon += c + '<end>';}
            }
            $('#'+css+'_field_polygon').val(new_svg_polygon);
          }
        }




// TODO





        $('#'+css+'_modal_edit').modal('hide');
      }
    });

//  Version ausgewählt
    $(htmltarget+' .'+css+'versions a').on('click', function() {
      var annoid = $(this).closest('.'+css+'item').attr('id');
      var anno = getAnnotation(annotations,annoid);
      var searchid = $(this).attr('data-versionid');
      var ver = getVersion(anno,$(this).attr('data-versionid'));
      if (typeof(ver) != 'undefined') {
        ver.content = getVersionContent(annotarget,annoid,ver,options);
        anno.shown_version = $(this).attr('data-versionid');
        anno.shown_version_polygons = ver.content.svg_polygon;
      }

      $('#old_version_'+annoid).html(versionTemplate);

      var app = new Vue({
        el: '#old_version_'+annoid,
        data: {
          text: t,
          item: ver.content,
//        Zur Schreibvereinfachung css nochmal separat...
          css: css,
          created_display: ver.created_display,
        }
      });

      $('#old_version_'+annoid).css('display','block');
      callHighlight(options['highlight'],annotations,annoid,css);
      $(htmltarget+' .'+css+'versclosebut').on('click', function() {
        $(this).closest('.'+css+'_old_version').css('display','none');
        delete anno['shown_version'];
        delete anno['shown_version_polygons'];
        callHighlight(options['highlight'],annotations,'',css);
      });
    });

//  Neue Annotation
    $(htmltarget+' .'+css+'new').on('click', function() {
//    Felder leeren
      $.each(config.fields, function (k, v) {
        if (k != 'text') {
          $('#'+css+'_field_'+k).val('');
        }
      });
      $('#'+css+'_field_parent').val(annotarget);
      initHTMLEditor('#'+css+'_modal_edit form textarea','de','');
      $('#'+css+'_modal_edit .modal-body .nav-tabs a:first').tab('show');
      $('#'+css+'_modal_edit').modal('toggle');
    });

//  Kommentar
    $(htmltarget+' .'+css+'commentbut').on('click', function() {
//    Felder leeren
      $.each(config.fields, function (k, v) {
        if (k != 'text') {
          $('#'+css+'_field_'+k).val('');
        }
      });
      initHTMLEditor('#'+css+'_modal_edit form textarea','de','');
      var commentonanno = getAnnotation(annotations,$(this).closest('.'+css+'item, .'+css+'comment').attr('id'));
      $('#'+css+'_field_parent').val(commentonanno.svname);
      $('#'+css+'_modal_edit .modal-body .nav-tabs a:first').tab('show');
      $('#'+css+'_modal_edit').modal('toggle');
    });

//   Annotation editieren
    $(htmltarget+' .'+css+'editbut').on('click', function() {
//    Felder vorausfüllen
      var editanno = getAnnotation(annotations,$(this).closest('.'+css+'item, .'+css+'comment').attr('id'));
      $.each(config.fields, function (k, v) {
        if (k != 'text') {
          $('#'+css+'_field_'+k).val(editanno[v]);
        }
      });
      $('#'+css+'_field_id').val(editanno.id);
      if (typeof(editanno.parent_svname) != 'undefined') {
        $('#'+css+'_field_parent').val(editanno.parent_svname);
      }
      else {
        $('#'+css+'_field_parent').val(annotarget);
      }
      initHTMLEditor('#'+css+'_modal_edit form textarea','de',editanno.text);
      $('#'+css+'_modal_edit .modal-body .nav-tabs a:first').tab('show');
      $('#'+css+'_modal_edit').modal('toggle');
    });

    callHighlight(options['highlight'],annotations,'',css);

    $(document).on('focusin', function(e) {
      if ($(e.target).closest(".mce-window").length) {
          e.stopImmediatePropagation();
      }
    });
}

function setAnnotationStatus(id,status,csspraefix) {
  if (status) {
    $('#'+id).addClass(csspraefix+'status-active');
  }
  else {
    $('#'+id).removeClass(csspraefix+'status-active');
  }
}

function initHTMLEditor (selector,language,content) {
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

function getAnnotation(annotations,annoid) {
  var single_annotation = {};
  var gef = 0;
  $.each(annotations, function (k, v) {
    if (!gef && v.id == annoid) {
      single_annotation = v;
      gef = 1;
    }
    if (!gef && v.hasChildren) {
      single_annotation = getAnnotation(v.children,annoid);
      if (typeof(single_annotation.id) != 'undefined') {gef = 1}
    }
  });
  return single_annotation;
}

function getVersion(annotation,versionid) {
  var single_version = {};
  $.each(annotation.versions, function (k, v) {
    if (v.idshort == versionid) {
      single_version = v;
    }
  });
  return single_version;
}

function getAnnotations(annotarget,options) {
  var annotations = [];
  var tokens = '';
  if (typeof(options.readtoken) != 'undefined' && options.readtoken.length) {tokens += '&rtok='+options.readtoken}
  if (typeof(options.writetoken) != 'undefined' && options.writetoken.length) {tokens += '&wtok='+options.writetoken}
  $.ajax({
    dataType: 'xml',
    url: 'http://digi.ub.uni-heidelberg.de/annotations?forward='+annotarget+'/fcr:export?recurse=true&skipBinary=false',
// neu:
//    url: config.annoserviceurl+'?service='+options.service+'&target='+annotarget+tokens,
    async: false,
  }).done(function (annoxml) {
//    var data = xmlToJson($.parseXML(annoxml));
    if (annoxml !== null) {
      var data = xmlToJson(annoxml);
      if (typeof(data['sv:node']) != 'undefined') {
        var data1 = data['sv:node'];
        $.each(data1['sv:property'], function (ky, val) {
          var a = val['@attributes'];
          if (a["sv:name"] == 'user_rights') {
            if (val['sv:value']['#text'] == 'comment') {



            }
          }
        });
        if (typeof(data1['sv:node']) != 'undefined') {
          convertTree(annotations, data1['sv:node'], annotarget, annotarget, options);
        }
        else {
          console.log('Error in reading data', data1)
        }
      }
    }
  });
  return annotations;
}

function getVersionContent(annotarget,annoidentifier,vers,options) {
  var versionid = vers.idshort;
  var result = {};
  var version = {};
  $.ajax({
    accepts: {
      jsonld: 'application/ld+json'
    },
    converters: {
      'text jsonld': function(result) {
        return JSON.parse(result);
      }
    },
    dataType: 'jsonld',
    url: 'http://digi.ub.uni-heidelberg.de/annotations?forward='+annotarget+'/'+annoidentifier+'/fcr:versions/'+versionid+'/',
// neu:
//      url: config.annoserviceurl+'?service='+options.service+'&target='+annotarget+'/'+annoidentifier+'/fcr:versions/'+versionid+'/',
    async: false,
  }).done(function (data) {
//  ???
    if (typeof(data[0]['http://purl.org/dc/elements/1.1/title']) != 'undefined') {result = data[0]}
    else {result = data[1]}
  });
  if (typeof(result) != 'undefined') {
    if (typeof(result['http://purl.org/dc/elements/1.1/title']) != 'undefined') {
      version.title = result['http://purl.org/dc/elements/1.1/title'][0]['@value'];
    }
    if (typeof(result['http://purl.org/dc/elements/1.1/description-ger']) != 'undefined') {
      version.text = result['http://purl.org/dc/elements/1.1/description-ger'][0]['@value'];
    }
    if (typeof(result['http://purl.org/dc/elements/1.1/source']) != 'undefined') {
      version.link = result['http://purl.org/dc/elements/1.1/source'][0]['@value'];
    }
    else {version.link = ''}
    if (typeof(result['http://www.w3.org/2000/svg#polygon']) != 'undefined') {
      for (var nr in result['http://www.w3.org/2000/svg#polygon']) {
        version.svg_polygon = result['http://www.w3.org/2000/svg#polygon'][nr]['@value'] + '<end>';
      }
    }
    if (vers["http://fedora.info/definitions/v4/repository#created"][0]['@value']) {
      version.date = vers["http://fedora.info/definitions/v4/repository#created"][0]['@value'];
    }
  }
  else {
    version.text = 'kein Annotationen vorhanden';
  }
  version.annotation_identifier = annoidentifier;

  return version;
}


function getVersions(anno,annotarget,options) {
  if (anno.versioned && !anno.versions_loaded) {
    $.ajax({
      accepts: {
        jsonld: 'application/ld+json'
      },
      converters: {
        'text jsonld': function(result) {
          return JSON.parse(result);
        }
      },
      dataType: 'jsonld',
      url: 'http://digi.ub.uni-heidelberg.de/annotations?forward='+annotarget+'/'+anno.id+'/fcr:versions',
// neu:
//      url: config.annoserviceurl+'?service='+options.service+'&target='+annotarget+'/'+anno.id+'/fcr:versions',
      async: false,
    }).done(function (versionjson) {
      if (typeof(versionjson) == 'object') {
        var sort_text = "http://fedora.info/definitions/v4/repository#created";
        versionjson = versionjson.splice(1, versionjson.length);
        anno.versions = versionjson.sort(function(a,b) {
          if (a[sort_text][0]['@value'] < b[sort_text][0]['@value']) return 1;
          if (a[sort_text][0]['@value'] > b[sort_text][0]['@value']) return -1;
          return 0;
        });
        $.each(anno.versions, function (k, v) {
          v.created_display = convertDate(v[sort_text][0]['@value']);
          v.idshort = v['@id'].split('/')[v['@id'].split('/').length-1];
        });
      }
    });
  }
  anno.versions_loaded = true;
}

function base64Decode(typ, s){
    if (typ=== 'Binary') {
        if (typeof s === 'object'){
            var out='';
            for (var i in s) {
                out += Base64.decode(s[i]);
            }
            return out;
        }
        else {
            return Base64.decode(s);
        }
    } else {
        return s
    }
}

function xmlToJson(xml) {
  var attr,
      child,
      attrs = xml.attributes,
      children = xml.childNodes,
      key = xml.nodeType,
      obj = {},
      i = -1;

  if (key === 1 && attrs.length) {
    obj[key = '@attributes'] = {};
    while (attr = attrs.item(++i)) {
      obj[key][attr.nodeName] = attr.value;
    }
    i = -1;
  } else if (key === 3) {
    obj = xml.nodeValue;
  }
  while (child = children.item(++i)) {
    key = child.nodeName;
    if (obj.hasOwnProperty(key)) {
      if (obj.toString.call(obj[key]) !== '[object Array]') {
        obj[key] = [obj[key]];
      }
      obj[key].push(xmlToJson(child));
    }
    else {
      obj[key] = xmlToJson(child);
    }
  }
  return obj;
}

function convertProperties(prop, properties, parent_string, options) {
  var anno = {};
/*  if (prop['@attributes']) {
    anno.identifier = prop['@attributes']['sv:name'];
console.log('anno.identifier: '+anno.identifier);
  } */
  if (properties['sv:name']) {
    anno.id = properties['sv:name'];
  }
  anno.iiif_url = '';
  anno.editable = false;
  anno.commentable = false;
  anno.hasChildren = false;
  anno.hasComment = false;
  anno.versions_loaded = false;
  anno.versions = [];
  $.each(prop, function (ky, val) {
    var a = val['@attributes'];
    var p ;
    if (typeof(val['sv:value']) != 'undefined' && typeof(val['sv:value']['#text']) != 'undefined') {
      p =base64Decode(a['sv:type'], val['sv:value']['#text']);

    }

    if (a["sv:name"] == 'svg:polygon') {
      anno.hasZones = 1;
    }

    $.each(config.typeList, function (k, v) {
      if (a["sv:name"] === k) {
        var strn = "anno." + v;
        if (typeof(val['sv:value']) != 'undefined') {
          if (typeof(val['sv:value']['#text']) == 'undefined') {
            var temp = "";
            $.each(val['sv:value'], function (key, value) {
              if (typeof(value['#text']) != 'undefined') {
                temp += base64Decode(a['sv:type'],value['#text']) + '<end>';
              }
            });
            anno[v] = temp;
          }
          else {
            anno[v] = p;
          }
        }
      }
    });
  });

  if (typeof(anno.user_rights) != 'undefined') {
    if (anno.user_rights == 'edit') {
      anno.editable = true;
      anno.commentable = true;
    }
    if (anno.user_rights == 'comment') {
      anno.commentable = true;
    }
  }

  if (typeof(properties) != 'undefined') {
    anno.svname = parent_string + '/' + properties['sv:name'];
    anno.clean_svname = properties['sv:name'];
  }

  if (typeof(anno.user_name) == 'undefined' || anno.user_name === '') {
    anno.user_name = anno.account;
  }
  if (typeof(anno.jcr_modified) != 'undefined' && anno.jcr_modified !== '') {
    anno.jcr_modified_display = convertDate(anno.jcr_modified);
  }

// IIIF-URL ergaenzen (temporaer, bis eigenes Target)
  if (anno.hasZones && typeof(options.iiif_url) != 'undefined' && typeof(options.iiif_img_width) != 'undefined' && typeof(options.iiif_img_height) != 'undefined' && options.iiif_url.length) {
    var allpolygons = [];
    if (typeof(anno.svg_polygon) != 'undefined') {
      var polygons = anno.svg_polygon.split('<end>');
      $.each(polygons, function (key, value) {
        if (value.length > 0 && typeof(value) != 'undefined' && value !== 'undefined') {
          allpolygons.push(JSON.parse('[' + value + ']'));
        }
      });
    }
    if (allpolygons.length) {
      anno.iiif_url = options.iiif_url + CoordUtils.anno_coordIIIF(allpolygons,options.iiif_img_width,options.iiif_img_height) + '/full/0/default.jpg';
    }
  }

  return anno;
}

function callHighlight(callback,annotations,active,csspraefix) {
    // Liste der Annotationen
    // Liste der aktiven Annotationen und Kommentare(IDs) Hash mit Stufe als Value?
    // Versions-Polygon
    try {
      var fn = window[callback];
      if (typeof(fn) == 'function') {
        fn(annotations,active,csspraefix,Cookies.get('showref'));
      }
    }
    catch(err) {
      console.log(err);
    }
}

function convertDate(datestring,loc) {
  var dateObj = new Date(datestring);
  return dateObj.toLocaleString();
}

function convertTree(toAdd, data1, parent_string, annotarget, options) {
  if ($.isArray(data1) === false) {
    var elem = convertProperties(data1['sv:property'], data1['@attributes'], parent_string, options);
    var element_position = toAdd.push(elem);
    if (toAdd.versioned !== null) {
      getVersions(toAdd,annotarget,options);
    }
    var child = data1['sv:node'];
    var pos = element_position - 1;
    if (child) {
      toAdd[pos].children = [];
      convertTree(toAdd[pos].children, child, elem.svname, annotarget, options);
      toAdd[pos].hasChildren = true;
      if (toAdd[pos].children[0].type == 'comment') {toAdd[pos].hasComment = true}
      for(var i = 0; i < toAdd[pos].children.length; i++) {
        toAdd[pos].children[i]['parent_svname'] = toAdd[pos].svname;
      }
    }
  }
  else {
    $.each(data1, function (key, value) {
      if (value['sv:property']) {
        var elem = convertProperties(value['sv:property'], value['@attributes'], parent_string, options);
        var element_position = toAdd.push(elem);
        var pos = element_position - 1;
        if (toAdd[key].versioned !== null) {
          getVersions(toAdd[key],annotarget,options);
        }
        var child = value['sv:node'];
        if (child) {
          toAdd[pos].children = [];
          convertTree(toAdd[pos].children, child, elem.svname, annotarget, options);
          toAdd[pos].hasChildren = true;
          if (toAdd[pos].children[0].type == 'comment') {toAdd[pos].hasComment = true}
          for(var i = 0; i < toAdd[pos].children.length; i++) {
            toAdd[pos].children[i]['parent_svname'] = toAdd[pos].svname;
          }
        }
      }
    });
  }
}

function popover_title(title) {
  return '<span class="text-info">'+title+'</span>&nbsp;&nbsp;<button type="button" id="close" class="close" onclick="$(\'.popover\').popover(\'hide\');">&times;</button>';
}



function anno_navigationThumb (thumbdrawing,origdrawing) {
  if (typeof(thumbdrawing) == 'undefined') {return}
  if (typeof(origdrawing) == 'undefined') {return}
  var status = Cookies.get('navThumb');
  if (status == '0') {return}

  $('#'+thumbdrawing.element_.id).fadeIn();
  $('#'+thumbdrawing.element_.id).next('.thumbEye').eq(0).fadeIn();
  clearTimeout(thumbTimeout);
  thumbTimeout = setTimeout(function() {
      $('#'+thumbdrawing.element_.id).fadeOut(1000)
      $('#'+thumbdrawing.element_.id).next('.thumbEye').eq(0).fadeOut(1000)
  }, 3000);

  var matrix = origdrawing.getViewbox().ctmDump();
  var trans = new goog.math.AffineTransform(matrix[0],matrix[1],matrix[2],matrix[3],matrix[4],matrix[5]);
  var scaleX = Math.sqrt(Math.pow(trans.getScaleX(),2)+Math.pow(trans.getShearX(),2));
  var scaleY = Math.sqrt(Math.pow(trans.getScaleY(),2)+Math.pow(trans.getShearY(),2)); /* == scaleX, wenn keine Scherung */
  var thumbWidth = thumbdrawing.getLayerBackground().getImage().getWidth();
  var thumbHeight = thumbdrawing.getLayerBackground().getImage().getHeight();
  var origwidth = origdrawing.getLayerBackground().getImage().getWidth();
  var origheight = origdrawing.getLayerBackground().getImage().getHeight();
  var faktorX = thumbWidth/(origwidth*scaleX);
  var faktorY = thumbHeight/(origheight*scaleY);

  var bildLO = [];
  trans.transform([0,0],0,bildLO,0,1);

  var ausschnittWidth = origdrawing.getCanvas().getWidth();
  var ausschnittHeight = origdrawing.getCanvas().getHeight();
  var ausschnittRect = new xrx.shape.Rect(thumbdrawing);

  var ausschnittRectP1 = [];
  var ausschnittRectP2 = [];
  var ausschnittRectP3 = [];
  var ausschnittRectP4 = [];
  var angle = CoordUtils.angleFromMatrix(matrix[0],matrix[1]);
/* Drechung 90 Grad rechts */
  if (angle == 270) {
    ausschnittRectP1 = [(0-bildLO[1])*faktorY,(bildLO[0]-ausschnittWidth)*faktorX];
    ausschnittRectP2 = [(ausschnittHeight-bildLO[1])*faktorY,(bildLO[0]-ausschnittWidth)*faktorX];
    ausschnittRectP3 = [(ausschnittHeight-bildLO[1])*faktorY,bildLO[0]*faktorX];
    ausschnittRectP4 = [(0-bildLO[1])*faktorY,bildLO[0]*faktorX]
  }
/* Drechung 180 Grad  */
  else if (angle == 180) {
    ausschnittRectP1 = [(bildLO[0]-ausschnittWidth)*faktorX,(bildLO[1]-ausschnittHeight)*faktorY];
    ausschnittRectP2 = [(bildLO[0])*faktorX,(bildLO[1]-ausschnittHeight)*faktorY];
    ausschnittRectP3 = [(bildLO[0])*faktorX,(bildLO[1])*faktorY];
    ausschnittRectP4 = [(bildLO[0]-ausschnittWidth)*faktorX,(bildLO[1])*faktorY];
  }
/* Drechung 90 Grad links */
  else if (angle == 90) {
    ausschnittRectP1 = [(bildLO[1]-ausschnittHeight)*faktorY,(0-bildLO[0])*faktorX];
    ausschnittRectP2 = [(bildLO[1])*faktorY,(0-bildLO[0])*faktorX];
    ausschnittRectP3 = [(bildLO[1])*faktorY,(ausschnittWidth-bildLO[0])*faktorX];
    ausschnittRectP4 = [(bildLO[1]-ausschnittHeight)*faktorY,(ausschnittWidth-bildLO[0])*faktorX]
  }
  else {
/* Drehung 0 Grad */
    ausschnittRectP1 = [(0-bildLO[0])*faktorX,(0-bildLO[1])*faktorY];
    ausschnittRectP2 = [(ausschnittWidth-bildLO[0])*faktorX,(0-bildLO[1])*faktorY];
    ausschnittRectP3 = [(ausschnittWidth-bildLO[0])*faktorX,(ausschnittHeight-bildLO[1])*faktorY];
    ausschnittRectP4 = [(0-bildLO[0])*faktorX,(ausschnittHeight-bildLO[1])*faktorY];
  }

  var rect = new xrx.shape.Rect(thumbdrawing);
  rect.setCoords([ausschnittRectP1,ausschnittRectP2,ausschnittRectP3,ausschnittRectP4]);
  rect.setStrokeWidth(1.5);
  var color = '#A00000';
  if (typeof(zonecolor) == 'object' && zonecolor.length > 3) {
    color = '#'+zonecolor[0];
  }
  rect.setStrokeColor(color);
  rect.setFillColor(color);
  rect.setFillOpacity(0.15);
  var rects = [];
  rects.push(rect);
  thumbdrawing.getLayerShape().removeShapes();
  thumbdrawing.getLayerShape().addShapes(rect);
  thumbdrawing.draw();
}

function anno_toggle_iiif (context) {
  context.parent().find('div').toggle();
  if (context.parent().find('div').css('display') == 'none') {
    context.find('span').removeClass('fa-caret-down');
    context.find('span').addClass('fa-caret-right');
  }
  else {
    context.find('span').removeClass('fa-caret-right');
    context.find('span').addClass('fa-caret-down');
  }
}

module.exports = {
    config,
    displayAnnotations,
};
