var zoneeditdrawing;
var zoneeditthumb;
var zoneedittarget = "";

var currentPopover = null;

var thumbTimeout;

var img_zoomst = {};
var img_angle = {};
var img_zoomlevel = {};
var img_element = {};
var timeoutHandle_store_only = {};

var viewtabtei = 0;

var lageninit = 0;

jQuery.fn.selectText = function(){
    this.find('input').each(function() {
        if($(this).prev().length == 0 || !$(this).prev().hasClass('p_copy')) { 
            $('<p class="p_copy" style="position: absolute; z-index: -1;"></p>').insertBefore($(this));
        }
        $(this).prev().html($(this).val());
    });
    var doc = document;
    var element = this[0];
    if (doc.body.createTextRange) {
        var range = document.body.createTextRange();
        range.moveToElementText(element);
        range.select();
    } else if (window.getSelection) {
        var selection = window.getSelection();        
        var range = document.createRange();
        range.selectNodeContents(element);
        selection.removeAllRanges();
        selection.addRange(range);
    }
};

function annohighlight(annotations,active,csspraefix,displayopt) {
  console.log(annotations);
  drawAllPolygons(annotations,active,csspraefix,displayopt);
}

function digiInit(sid,urn,project,page,path) {
  $('.lpbutton').click(function(){
    $.ajax({
      url: "/"+path+"/"+project+"/"+page+"/_check?sid="+sid,
    }).done(function( data ) {
      change_lpbutton(data.substr(0,1));
    });
  })
  if (!areCookiesEnabled()) {
    $('.lpbutton').attr('disabled','disabled');
  }

  $('.drawingCanvas').bind(
     'touchmove',
      function(e) {
        e.preventDefault();
      }
  );

  $('.thumbCanvas').bind(
     'touchmove',
      function(e) {
        e.preventDefault();
      }
  );

  if (typeof(Cookies) != 'undefined' && Cookies.get('navThumb') == '0') {
    $('.navthumb').find('span').removeClass('fa-eye');
    $('.navthumb').find('span').addClass('fa-eye-slash');
    $('.navthumb').addClass('active');
  }

  $('.doiChapter').popover({title: popover_title('DOI'), html: true});

  $('.watermarkimage img').click(function(){toggle_watermark($(this).parent())});
  $('.watermarkimage .watermarkzoom').click(function(){toggle_watermark($(this).parent())});
  $('.watermarkimage .watermarkflip').click(function(){toggle_watermark_flip($(this).parent(),'X')});
  $('.watermarkimage .watermarkflipY').click(function(){toggle_watermark_flip($(this).parent(),'Y')});

  $(".nav-tabs a[data-toggle=tab]").on("click", function(e) {
    if ($(this).parent("li").hasClass("disabled")) {
      e.preventDefault();
      return false;
    }
  });

  var annohinwtitle = popover_title(l10n_text(lang,'Hinweis'));
  $('.annohinweis').popover({content: l10n_text(lang,'annotationenhinweis'), placement: 'left', title: annohinwtitle, html: true});

  var logouttitle = popover_title(l10n_text(lang,'Abmelden'));
  $('#logout').popover({content: l10n_text(lang,'Abmeldehinweis'), title: logouttitle, html: true, placement: 'left'});

  var loginhinwtitle = popover_title(l10n_text(lang,'Hinweis'));
  $('#logininfo').popover({content: l10n_text(lang,'loginhinweis'), placement: 'left', title: loginhinwtitle, html: true}); 


  $('.purlmodlink').click(function(){$('#purlmod').modal()});
  $('.purlmodurl').click(function(){$(this).selectText()});
  $('.purl').click(function(){$('#purlmod').modal()});
  if (urn) {
    $('.urnmodlink').click(function(){window.location.href=urn});
    $('.urn').click(function(){window.location.href=urn});
  }

  $('#toctoggle').click(function () {tocToggle(sid)});

  $('#annoclickleft').click(function(){rightColumnOff(sid)});
  $('#annoclickright').click(function(){rightColumnOn(sid)});
  $('#metaclickright').click(function(){leftColumnOff(sid)});
  $('#metaclickleft').click(function(){leftColumnOn(sid)});
  $('.annobutton').click(function () {
     if ($("#annoclickleft").hasClass("hidden")) {
       rightColumnOn(sid);
       var pos = $("#annotationsblock").offset().top;
       if (pos > 200) {
         pos -= 80;
         $('html, body').animate({scrollTop: pos}, 0);
       }
     }
     else {
       rightColumnOff(sid);
     }
  });

  $(document).on('shown.bs.popover', function (ev) {
    var target = $(ev.target);
    if (currentPopover && (currentPopover.get(0) != target.get(0))) {
      currentPopover.popover('toggle');
    }
    currentPopover = target;
  });

  $(document).on('hidden.bs.popover', function (ev) {
    var target = $(ev.target);
    if (currentPopover && (currentPopover.get(0) == target.get(0))) {
      currentPopover = null;
    }
  });

  if ($('#lagenAnzeige').length && $('#lagenAnzeige').is(':visible')) {lagenInit()}
  $('#lagenCloseBut, #lagenAnzeige h2, #lagenAnzeigeOff button').click(function(){
    lagenToggle(sid);
  });

  $(document).on('change', 'input:radio[id^="teiformat1_"]', function (event) {tei_change_format(project,page,sid)});
  $(document).on('change', 'input:radio[id^="teiformat2_"]', function (event) {tei_change_no(sid)});
  $(document).on('change', 'input:radio[id^="teiformat3_"]', function (event) {tei_change_abbr(project,page,sid)});
  $(document).on('change', 'input:radio[id^="teiformat4_"]', function (event) {tei_change_bf(project,page,sid)});
  $(document).on('change', 'input:radio[id^="teiformat5_"]', function (event) {tei_change_mod(project,page,sid)});
  $(document).on('change', 'input:radio[id^="teiformat6_"]', function (event) {tei_change_pc(sid)});
  $(document).on('change', 'input:radio[id^="teiformat7_"]', function (event) {tei_change_rhyme(sid)});
  $(document).on('change', 'input:radio[id^="teiformat8_"]', function (event) {tei_change_edit(project,page,sid)});
  $(document).on('change', 'input:radio[id^="teiformat9_"]', function (event) {tei_change_column(sid)});
  $(document).on('change', 'input:radio[id^="teiformat10_"]', function (event) {tei_change_img(sid)});
  $(document).on('change', 'input:radio[id^="teiformat11_"]', function (event) {tei_change_actor(sid)});
  $(document).on('change', 'input:radio[id^="teiformat12_"]', function (event) {tei_change_norm(project,page,sid)});
  $(document).on('change', 'input:radio[id^="teiformat13_"]', function (event) {tei_change_wordsep(project,page,sid)});

// Beim Anzeigen des TEI-Optionen-Modal-Fensters
  $('#teioptions').on('shown.bs.modal',function(){
    $('.popover').popover('hide');
    enable_tei_buttons();
  });

  $('#teichangehistbut').on('click',function() {
    toggle_tei_change_hist(project,pagename,sid,'',path);
  });
}

function check_annotations (proxyURL,project,page,sid,rightColumn) {
  var annoproxyurl = proxyURL+"?forward=/"+project+"/"+page+"/fcr:export?recurse=true&sid="+sid;
  $.get(
    annoproxyurl
  ).done(function (data, status) {
     var child_count = 0;
     if (data.childNodes){
       if (data.childNodes[0]){
         if (data.childNodes[0].childNodes) {
           for (i = 0; i < data.childNodes[0].childNodes.length; i++) { 
             if (data.childNodes[0].childNodes[i].nodeName==='sv:node'){
               child_count +=1 ;
             }
           }
         }
       } 
       if (child_count > 0) {
         $(".annoNumber").text(' '+child_count);
         $(".annobutton").addClass('btn-danger');
         if (rightColumn) {rightColumnOn('')}
       }
     }
 }).fail(function () {
   rightColumnOff('');
   console.log('repository error');
 });
}

function tocToggle(sid) {
    if ($('#toc').is(':visible')) {
      $('#toc').addClass('hidden-xs hidden-sm');
      $('#toctoggle span').removeClass('fa-caret-down');
      $('#toctoggle span').addClass('fa-caret-right');
      $.ajax("?sid="+sid+"&store_only=1&leftcolumn_compactview_hidden=1");
    }
    else {
      $('#toc').removeClass('hidden-xs hidden-sm');
      $('#toctoggle span').removeClass('fa-caret-right');
      $('#toctoggle span').addClass('fa-caret-down');
      $.ajax("?sid="+sid+"&store_only=1&leftcolumn_compactview_hidden=0");
    }
}

function rightColumnOn(sid) {
    var contentcols = "col-md-6 col-lg-7";
    if ($("#metaclickright").length == 0) {
      contentcols = "col-md-6 col-lg-7 rightcol";
    }
    else {
      if ($("#metaclickright").hasClass("hidden")) {
        contentcols = "col-md-9 col-lg-9";
      }
    }
    $("#content").attr("class", contentcols);
    $("#annotationsblock").attr("class", "col-md-3 col-lg-3");
    $("#annoclickright").attr("class", "hidden");
    $("#annoclickleft").attr("class", "col-md-offset-9 col-lg-offset-9 hidden-print hidden-xs hidden-sm");
    if (sid) {$.ajax("?sid="+sid+"&store_only=1&rightwidth=1")}
}

function rightColumnOff(sid) {
    var contentcols = "col-md-9 col-lg-10";
    if ($("#metaclickright").length == 0) {
      contentcols = "col-md-9 col-lg-10 rightcol";
    }
    else {
      if ($("#metaclickright").hasClass("hidden")) {
        contentcols = "col-md-12 col-lg-12";
      }
    }
    $("#annotationsblock").attr("class", "hidden hidden-print");
    $("#content").attr("class", contentcols);
    $("#annoclickright").attr("class", "hidden-print hidden-xs hidden-sm");
    $("#annoclickleft").attr("class", "hidden");
    if (sid) {$.ajax("?sid="+sid+"&store_only=1&rightwidth=0")}
}

function leftColumnOn(sid) {
    var contentcols = "col-md-6 col-lg-7";
    if ($("#annoclickleft").hasClass("hidden")) {
      contentcols = "col-md-9 col-lg-10";
    }
    $("#content").attr("class", contentcols);
    $("#content").attr("style", "padding-right: 10px;");
    $("#meta").attr("class", "col-md-3 col-lg-2");
    $("#metaclickleft").attr("class", "hidden");
    $("#metaclickright").attr("class", "col-md-offset-3 col-lg-offset-2 hidden-xs hidden-sm hidden-print");
    $.ajax("?sid="+sid+"&store_only=1&leftwidth=1");
}

function leftColumnOff(sid) {
    var contentcols = "col-md-9 col-lg-9";
    if ($("#annoclickleft").hasClass("hidden")) {
      contentcols = "col-md-12 col-lg-12";
    }
    $("#meta").attr("class", "hidden");
    $("#content").attr("class", contentcols);
    $("#content").attr("style", "padding-right: 10px; padding-left: 20px;");
    $("#metaclickright").attr("class", "hidden");
    $("#metaclickleft").attr("class", "hidden-xs hidden-sm hidden-print");
    $.ajax("?sid="+sid+"&store_only=1&leftwidth=0");
}

function change_lpbutton (state) {
  if (state == '1') {
    $('.lpbutton').addClass('active');
    $('.lpbutton span').removeClass('glyphicon');
    $('.lpbutton span').removeClass('glyphicon-pushpin');
    $('.lpbutton span').addClass('fa');
    $('.lpbutton span').addClass('fa-thumb-tack');
    $('.lpbutton').css('color','#a0000');
    $('.lpbutton').css('padding','6px 12px');
  }
  else {
    $('.lpbutton').removeClass('active');
    $('.lpbutton span').removeClass('fa');
    $('.lpbutton span').removeClass('fa-thumb-tack');
    $('.lpbutton span').addClass('glyphicon');
    $('.lpbutton span').addClass('glyphicon-pushpin');
    $('.lpbutton').css('color','#333');
    $('.lpbutton').css('padding','6px 10px 6px 9px');
  }
}

function load_thumbs(project,page,sid) {
// bereits geladen?
   if ($('#tab_thumbs').attr('data-thumbs-loaded') == 'yes') {return}

   $.ajax({
      type: "GET",
      url: "/"+digipath+"/"+project+"/"+page+"/_thumbs?sid="+sid,
      error: function(data){
        console.log("There was a problem");
      },
      success: function(data){
        $('#tab_thumbs .thumblist').html(data);
        $('#tab_thumbs').attr('data-thumbs-loaded','yes');
        aTag = $("a[name='current_page']");
        if (typeof(aTag) != 'undefined') {
          var offset = aTag.offset().top;
          if (offset > 50) {offset = offset - 50};
          $('html,body').animate({scrollTop: offset});
        }
        thumb_annotations(project,sid);
      }
   });
}

function adressbuchsuche(alph) {
    window.location.href="http://www.ub.uni-heidelberg.de/cgi-bin/hd_adressbuch.cgi?"+$("#adressbuchsuche_form").serialize()+"&alph="+alph;
};

function matrikelsuche(alph) {
    window.location.href="http://www.ub.uni-heidelberg.de/cgi-bin/hd_matrikel.cgi?"+$("#matrikelsuche_form").serialize()+"&alph="+alph;
};

function thumb_annotations(project,sid) {
    if (typeof(thumbannourl) != 'undefined') {
      if (thumbannourl) {
        $.ajax({
          type: "GET",
          url: thumbannourl+'?forward=/'+project+'/fcr:export?recurse=true&sid='+sid,
          error: function(data){
            console.log("There was a problem");
          },
          success: function(data){
            if (data) {
              var topchildren = data.childNodes;
              var children = topchildren.item(0).childNodes;
              var i = -1;
              while (child = children.item(++i)) { 
                if (child.nodeName == 'sv:node') {
                  var attrs = child.attributes;
                  var j = -1;
                  var attr;
                  while (attr = attrs.item(++j)) { 
                    if (attr.nodeName == 'sv:name') {
                      $('#th_'+parseInt(attr.value)+' > a > span.tpn').append('&nbsp;<span class="fa fa-comments-o"></span>');
                    }
                  }
                }
              }
            }
          } 
        });   
      }
    }
}

function searchHighlight (context) {
    if (typeof(searchtext) != 'undefined' && searchtext != '') {
      var s= searchtext.replace(/&quot;/g,' ');
      s = s.trim();
      var swords = s.split(/\s+/);
      swords.forEach(function(w) {
        $(context).highlight(w,"true");
      });
    }
}

function popover_title(title) {
  return '<span class="text-info">'+title+'</span>&nbsp;&nbsp;<button type="button" id="close" class="close" onclick="$(\'.popover\').popover(\'hide\');">&times;</button>';
}

function openZoneDialog(a) {
  zoneedittarget = a;
  $('#zoneeditcanvas canvas').remove();
  $('#zoneeditthumb canvas').remove();
  $('#zoneDialog').modal({backdrop: 'static'});
  $("#zoneedittoolbar button").removeClass('active');
  $("#zoneeditview").addClass('active');
}

function initZoneEdit() {
  $("#zoneDialog").on('hidden.bs.modal', function(event){
    $('#annoclickleft').show();
  });
  $("#zoneDialog").on('shown.bs.modal', function(event){
    $('#annoclickleft').hide();
    var backgroundImage = '';
    var iw = 0;
    if ($.isArray(img_zoomst[projectname+'_'+pagename]) && img_zoomst[projectname+'_'+pagename].length) {
      backgroundImage = img_zoomst[projectname+'_'+pagename][0]['url']; 
      iw = img_zoomst[projectname+'_'+pagename][0]['width'];
    }
    var w = $('#zoneDialog .modal-dialog').innerWidth() - 50;
    $('#zoneeditcanvas').css('width',w);
    zoneeditdrawing = new xrx.drawing.Drawing(goog.dom.getElement('zoneeditcanvas'));
    zoneeditdrawing.eventViewboxChange = function (x, y) {navigationThumb(zoneeditthumb,zoneeditdrawing)}
    if (zoneeditdrawing.getEngine().isAvailable()) {
      zoneeditdrawing.setBackgroundImage(backgroundImage, function() {
        zoneeditdrawing.setModeView();
        zoneeditdrawing.getViewbox().fitToWidth(false);
        zoneeditdrawing.getViewbox().setZoomFactorMax(4);
        var z = $('#'+zoneedittarget+' input[name="svg_polygon"]').val();
        if (z.length > 0) {
          var p = z.split('<end>');
          var i;
          var shapes = new Array();
          for (i = 0; i < p.length; i++) {
            if (p[i]) {
              var coords = coordRel2Abs(JSON.parse('['+p[i]+']'),iw);
              var shape;
              if (isRectangle(coords)) {
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
        zoneeditthumb = new xrx.drawing.Drawing(goog.dom.getElement('zoneeditthumb'));
        if (zoneeditthumb.getEngine().isAvailable()) {
          zoneeditthumb.setBackgroundImage('/'+digipath+'/'+projectname+'/'+pagename+'/_thumb_image', function() {
            zoneeditthumb.setModeDisabled();
            zoneeditthumb.getViewbox().fit(true);
            zoneeditthumb.getViewbox().setPosition(xrx.drawing.Orientation.NW); ;
            zoneeditthumb.draw();
            navigationThumb(zoneeditthumb,zoneeditdrawing)
          });
        }
      });
    }
    $("#zoneeditview").addClass('active');
  });
  $("#zoneeditzoomout").on('click', function(){
    zoneeditdrawing.getViewbox().zoomOut();
    navigationThumb(zoneeditthumb,zoneeditdrawing)
  });
  $("#zoneeditzoomin").on('click', function(){
    zoneeditdrawing.getViewbox().zoomIn();
    navigationThumb(zoneeditthumb,zoneeditdrawing)
  });
  $("#zoneeditfittocanvas").on('click', function(){
    zoneeditdrawing.getViewbox().fit(true);
    zoneeditdrawing.getViewbox().setPosition(xrx.drawing.Orientation.NW); 
    navigationThumb(zoneeditthumb,zoneeditdrawing)
  });
  $("#zoneeditrotleft").on('click', function(){
    zoneeditdrawing.getViewbox().rotateLeft();
    zoneeditthumb.getViewbox().rotateLeft();
    navigationThumb(zoneeditthumb,zoneeditdrawing)
  });
  $("#zoneeditrotright").on('click', function(){
    zoneeditdrawing.getViewbox().rotateRight();
    zoneeditthumb.getViewbox().rotateRight();
    navigationThumb(zoneeditthumb,zoneeditdrawing)
  });
  $("#zoneeditpolygon").on('click', function(){
    var styleCreatable = new xrx.shape.Style();
    styleCreatable.setFillColor('#3B3BFF');
    styleCreatable.setFillOpacity(.1);
    styleCreatable.setStrokeWidth(1);
    styleCreatable.setStrokeColor('#3B3BFF');
    var np = new xrx.shape.Polygon(zoneeditdrawing);
    np.setStyle(styleCreatable);
    np.getCreatable().setStyle(styleCreatable);
    zoneeditdrawing.setModeCreate(np.getCreatable());
    zoneeditdrawing.draw();
    $("#zoneedittoolbar button").removeClass('active');
    $("#zoneeditpolygon").addClass('active');
    $("#zoneeditdel").addClass('disabled');
  });
  $("#zoneeditrect").on('click', function(){
    var styleCreatable = new xrx.shape.Style();
    styleCreatable.setFillColor('#3B3BFF');
    styleCreatable.setFillOpacity(.1);
    styleCreatable.setStrokeWidth(1);
    styleCreatable.setStrokeColor('#3B3BFF');
    var nr = new xrx.shape.Rect(zoneeditdrawing);
    nr.setStyle(styleCreatable);
    nr.getCreatable().setStyle(styleCreatable);
    zoneeditdrawing.setModeCreate(nr.getCreatable());
    zoneeditdrawing.draw();
    $("#zoneedittoolbar button").removeClass('active');
    $("#zoneeditrect").addClass('active');
    $("#zoneeditdel").addClass('disabled');
  });
  $("#zoneeditview").on('click', function(){
    zoneeditdrawing.setModeView();
    $("#zoneedittoolbar button").removeClass('active');
    $("#zoneeditview").addClass('active');
    $("#zoneeditdel").addClass('disabled');
  });
  $("#zoneeditmove").on('click', function(){
    zoneeditdrawing.setModeModify();
    $("#zoneedittoolbar button").removeClass('active');
    $("#zoneeditmove").addClass('active');
    $("#zoneeditdel").removeClass('disabled');
  });
  $("#zoneeditdel").on('click', function(){
    if (typeof(zoneeditdrawing.getSelectedShape()) == 'undefined') {
      alert("Please select a shape");
      return;
    }
    if (window.confirm("Delete selected shape?")) {
      zoneeditdrawing.removeShape(zoneeditdrawing.getSelectedShape());
    }
  });
  $("#zoneDialogSave").on('click', function(){
    $('#annoclickleft').show();
    var iw = 0;
    if ($.isArray(img_zoomst[projectname+'_'+pagename]) && img_zoomst[projectname+'_'+pagename].length) {
      iw = img_zoomst[projectname+'_'+pagename][0]['width']; // todo - jb; war: img_zoomst.length-1
    }
    var shapes = zoneeditdrawing.getLayerShape().getShapes();
    var i;
    var j;
    var new_svg_polygon = '';
    for (i = 0; i < shapes.length; i++) {
      var c = ''
      var polygonnew = coordAbs2Rel(shapes[i].getCoords(),iw);
      for (j = 0; j < polygonnew.length; j++) {
        if (j > 0) {c += ','}
        c += JSON.stringify(polygonnew[j]);
      }
      if (c) {new_svg_polygon += c + '<end>';}
     }
     
     $('#'+zoneedittarget+' input[name="svg_polygon"]').val(new_svg_polygon);
     $('#'+zoneedittarget+' .annozonehinw').show();
  });
}

function coordAbs2Rel (polygon,imgwidth) {
  var i;
  var polygonrel = new Array();
  if ($.isArray(polygon) && imgwidth > 0) {
    for (i = 0; i < polygon.length; i++) {
      var p = polygon[i];
      var px = p[0] * 1000 / imgwidth;
      var py = p[1] * 1000 / imgwidth;
      polygonrel.push([px,py]);
    }
  }
  return polygonrel;
}

function coordRel2Abs (polygon,imgwidth) {
  var i;
  var polygonabs = new Array();
  if ($.isArray(polygon) && imgwidth > 0) {
    for (i = 0; i < polygon.length; i++) {
      var p = polygon[i];
      var px = Math.round(p[0] * imgwidth / 1000);
      var py = Math.round(p[1] * imgwidth / 1000);
      polygonabs.push([px,py]);
    }
  }
  return polygonabs;
}

function toggleNavigationThumb (imgkey) {
  if (typeof(Cookies) != 'undefined') {
    if (Cookies.get('navThumb') == '0') {
      Cookies.set('navThumb',1);
      $('.navthumb_'+imgkey).find('span').removeClass('fa-eye-slash');
      $('.navthumb_'+imgkey).find('span').addClass('fa-eye');
      $('.navthumb_'+imgkey).removeClass('active');
      drawThumb(imgkey,0);
    }
    else {
      Cookies.set('navThumb',0);
      $('.navthumb_'+imgkey).find('span').removeClass('fa-eye');
      $('.navthumb_'+imgkey).find('span').addClass('fa-eye-slash');
      $('.navthumb_'+imgkey).addClass('active');
      clearTimeout(thumbTimeout);
      $('#'+img_element[imgkey]['thumb'].element_.id).fadeOut();
      $('#'+img_element[imgkey]['thumb'].element_.id).next('.thumbEye').eq(0).fadeOut();
    }
  }
}

function navigationThumb (thumbdrawing,origdrawing) {
  if (typeof(thumbdrawing) == 'undefined') {return}
  if (typeof(origdrawing) == 'undefined') {return}
  var status = Cookies.get('navThumb');
  if (status == '0') {return}

  $('#'+thumbdrawing.element_.id).fadeIn();
  $('#'+thumbdrawing.element_.id).next('.thumbEye').eq(0).fadeIn();
  clearTimeout(thumbTimeout);
  thumbTimeout = window.setTimeout(function() {$('#'+thumbdrawing.element_.id).fadeOut(1000);$('#'+thumbdrawing.element_.id).next('.thumbEye').eq(0).fadeOut(1000);}, 3000);

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

  var bildLO = new Array();
  trans.transform([0,0],0,bildLO,0,1);

  var ausschnittWidth = origdrawing.getCanvas().getWidth();
  var ausschnittHeight = origdrawing.getCanvas().getHeight();
  var ausschnittRect = new xrx.shape.Rect(thumbdrawing);

  var ausschnittRectP1 = new Array();
  var ausschnittRectP2 = new Array();
  var ausschnittRectP3 = new Array();
  var ausschnittRectP4 = new Array();
  var angle = angle_from_matrix(matrix[0],matrix[1]);
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
  var rects = new Array();
  rects.push(rect);
  thumbdrawing.getLayerShape().removeShapes();
  thumbdrawing.getLayerShape().addShapes(rect);
  thumbdrawing.draw();
}

function angle_from_matrix (m00,m01) {
  var deg=Math.atan2(m01*-1, m00)*180/Math.PI;
  if(deg<0) { deg+=360; }
  return Math.round(deg);
} 

function toggle_watermark (context) {
  if (context.find('img').hasClass('WMsmall')) {
    context.find('img').removeClass('WMsmall'); 
  }
  else {
    context.find('img').addClass('WMsmall'); 
  }
}

function toggle_watermark_flip (context,dir) {
  var c = 'WMflip';
  if (dir == 'Y') {c = 'WMflipY'}
  if (context.find('img').hasClass(c)) {
    context.find('img').removeClass(c);
  }
  else {
    context.find('img').addClass(c);
  }
}

function areCookiesEnabled() {
  var cookieEnabled = navigator.cookieEnabled;

  if (cookieEnabled === false) {
    return false;
  }
  if (!document.cookie && (cookieEnabled === null || /*@cc_on!@*/false))
  {
    document.cookie = "testcookie=1";

    if (!document.cookie) {
      return false;
    } else {
      document.cookie = "testcookie=; expires=" + new Date(0).toUTCString();
    }
  }

  return true;
}

function massstab(key,scaleX) {
  if (typeof(img_zoomst[key][0]['xdpi']) == 'undefined') {return}
  if ($('#massstab_'+key).length == 0) {return}

  var xdpi = img_zoomst[key][0]['xdpi'];
  var wpx = scaleX*(xdpi/5.08);
  var s = "1 cm";
  var shalb = "0,5";
  if (wpx < 25) {
    s = "5 cm";
    shalb = "2,5";
    wpx *= 5;
  }
  else {
    if (wpx < 50) {
      s = "2 cm";
      shalb = "1";
      wpx *= 2;
    }
  }
  if (wpx > 30) {
    $('#massstab_'+key+' .massstabw').css('width',wpx+'px');
    $('#massstab_'+key+' .massstabs').css('width',wpx+'px');
    $('#massstab_'+key+' .massstablabel').html(s);
    $('#massstab_'+key+' .massstablabelhalb').html(shalb);
    $('#massstab_'+key+' .massstablabelhalb').css('width',(wpx+6)+'px');
    $('#massstab_'+key+' .massstablabel').css('width',(wpx+8)+'px');
    $('#massstab_'+key).show();
  }
  else {
    $('#massstab_'+key).hide();
  }
}

function isRectangle(c) {
  if ($.isArray(c)) {
    if (c.length == 4) {
      var xcoords = {};
      var ycoords = {};
      var i;
      var oldx = 0; 
      var oldy = 0;
      for (i = 0; i < c.length; i++) {
        if (xcoords[c[i][0]]) {xcoords[c[i][0]]++}
        else {xcoords[c[i][0]]=1}
        if (ycoords[c[i][1]]) {ycoords[c[i][1]]++}
        else {ycoords[c[i][1]]=1}
        if (i > 0) {
          if (c[i][0] != oldx && c[i][1] != oldy) {return false}
        }
        oldx = c[i][0];
        oldy = c[i][1];
      }
      var size = 0, key;
      for (key in xcoords) {
        if (xcoords.hasOwnProperty(key)) {
          size++;
          if (xcoords[key] != 2) {return false}
        }
      }
      if (size != 2) {return false} 
      size = 0;
      for (key in ycoords) {
        if (ycoords.hasOwnProperty(key)) {
          size++;
          if (ycoords[key] != 2) {return false}
        }
      }
      if (size != 2) {return false}
      return true;
    }
  }
  return false;
}


function optimalCanvasWidth (imgkey) {
  var w = 0;

// Leuchtpult
  if ($('#dC_'+imgkey).parents('.pultelement').length) {
//  width = 100%
  }
// Einzelansicht
  else {
    var w = Math.round($(window).width() - $('#content').offset().left - 31);
    if (w < 0) {w = 10}
  }
  return Math.round(w);
}

function optimalCanvasHeight (imgkey) {
  var h = 0;
 
// Leuchtpult
  if ($('#dC_'+imgkey).parents('.pultelement').length) {
//  Höhe Funktionsbuttonleiste
    var h1 = 0;
    $('#dC_'+imgkey).prev().each(function () {
      h1 += $(this).innerHeight();
    });
//  Höhe Überschriftenzeile Pultelement
    var h2 = 0;
    if ($('#dC_'+imgkey).parents('.panel').find('.panel-heading').length) {
      h2 = $('#dC_'+imgkey).parents('.panel').find('.panel-heading').eq(0).outerHeight();
    }
//  Höhe Tabs Editionssicht (Text, Fasimile)
    var h3 = 0;
    if ($('#dC_'+imgkey).parents('.panel-body').find('ul.nav-tabs').length) {
      h3 = $('#dC_'+imgkey).parents('.panel-body').find('ul.nav-tabs').eq(0).outerHeight();
    }
    h = $('#dC_'+imgkey).parents('.pultelement').eq(0).outerHeight() - h1 - h2 - h3 - 15;
  }
// Einzelansicht
  else {
    h = Math.round($(window).height() - 16);
    if (h < 0) {h = 10}
    if (typeof dispsize != 'undefined' && dispsize == 2) {h *= 2}
  }
  return Math.round(h);
}

function setOptimalCanvasSize (imgkey) {
  var h = optimalCanvasHeight(imgkey);
  var w = optimalCanvasWidth(imgkey);
  if (w) {$('#dC_'+imgkey).width(w)}
  if (h) {$('#dC_'+imgkey).height(h)}
}

/* function imginit
   Initialisieren des Canvas-Elements */

function imginit (imgkey) {
  var canvasid = 'dC_'+imgkey;
  var thumbid = 'tC_'+imgkey;
  var thumbexist = 0;
  if ($('#'+thumbid).length) {thumbexist = 1}

// Canvas-Höhe setzen (div-Element)
  setOptimalCanvasSize(imgkey);

// Canvas-Elemente initialisieren
  if (typeof img_element[imgkey] == 'undefined') {img_element[imgkey] = {}}
  img_element[imgkey]['drawing'] = new xrx.drawing.Drawing(goog.dom.getElement(canvasid));
  img_element[imgkey]['drawing'].setEventTarget(xrx.drawing.EventTarget.VIEWBOX);
  if (thumbexist) {
    img_element[imgkey]['thumb'] = new xrx.drawing.Drawing(goog.dom.getElement(thumbid));
  }

// Thumb-Element darstellen
  drawThumb(imgkey,0);

// Slider-Elemente prüfen und initialisieren
  img_element[imgkey]['sliders'] = [];
  if ($('#zoom_slider_top_'+imgkey)) {
    img_element[imgkey]['sliders'].push('zoom_slider_top_'+imgkey);
  }
  if ($('#zoom_slider_bottom_'+imgkey)) {
    img_element[imgkey]['sliders'].push('zoom_slider_bottom_'+imgkey);
  }
  img_element[imgkey]['sliders'].forEach(function (element) {
    $('#'+element).slider({ 
      value: img_zoomlevel[imgkey],
      min: 0.5,
      max: 4,
      step: 0.25,
      slide: function( event, ui ) {
        img_element[imgkey]['drawing'].getViewbox().zoomTo(ui.value,[0,0]);
      }
    });
  });

// Canvas-Size-Button
  if (typeof dispsize != 'undefined' && dispsize == 2) {
    $('.canvassize_'+imgkey+' span.fa-expand').removeClass('fa-expand').addClass('fa-compress');
  }

// Button-Elemente prüfen und initialisieren
  $('.zoom_minus_'+imgkey).click(function() {
    img_element[imgkey]['drawing'].getViewbox().zoomOut([0,0]);
  });
  $('.zoom_plus_'+imgkey).click(function() {
    img_element[imgkey]['drawing'].getViewbox().zoomIn([0,0]);
  });
  $('.rotate_left_'+imgkey).click(function() {
    img_element[imgkey]['drawing'].getViewbox().rotateLeft();
    img_element[imgkey]['drawing'].getViewbox().setPosition(xrx.drawing.Position.NW);
  });
  $('.rotate_right_'+imgkey).click(function() {
    img_element[imgkey]['drawing'].getViewbox().rotateRight();
    img_element[imgkey]['drawing'].getViewbox().setPosition(xrx.drawing.Position.NW);
  });
  $('.img_fit_'+imgkey).click(function() {
    img_element[imgkey]['drawing'].getViewbox().fit(false);
    img_element[imgkey]['drawing'].getViewbox().setPosition(xrx.drawing.Position.NW);
  });
  $('.canvassize_'+imgkey).click(function() {
    toggleCanvasHeight(imgkey);
  });
  $('.navthumb_'+imgkey).click(function() {
    toggleNavigationThumb(imgkey);
  });

  var backgroundImage = '';
  var z = 0;
  if ($.isArray(img_zoomst[imgkey]) && img_zoomst[imgkey].length) {
      // zoomstufe wie folgt aussuchen: test.breite  >= (breite kleinste Stufe)*scaleX
    while (img_zoomst[imgkey][z].width < img_zoomst[imgkey][0].width * img_zoomlevel[imgkey] && z < img_zoomst[imgkey].length - 1) {
      z++;
    }
    backgroundImage = img_zoomst[imgkey][z]['url'];
  }

  var ZoomFactorMax = 4;
  var ZoomFactorMin = 0.5;

// setBackground: Bild anzeigen
  img_element[imgkey]['drawing'].setBackgroundImage(backgroundImage, function () {
    img_element[imgkey]['drawing'].setModeHover(true);
    img_element[imgkey]['drawing'].getViewbox().setZoomFactorMax(ZoomFactorMax);
    img_element[imgkey]['drawing'].getViewbox().setZoomFactorMin(ZoomFactorMin);
    img_element[imgkey]['drawing'].getViewbox().ctmRestore([img_zoomlevel[imgkey], 0, 0, img_zoomlevel[imgkey], 0, 0]);
    img_element[imgkey]['drawing'].handleResize();

    if (z > 0) {
      var getImage = img_element[imgkey]['drawing'].getLayerBackground().getImage();
      var image = getImage.getImage();
      var width0 = img_zoomst[imgkey][0].width;
      var height0 = img_zoomst[imgkey][0].height;
//     image.setSize(width0, height0);
      image.width = width0;
      image.height = height0;
      getImage.geometry_.width = width0;
      getImage.geometry_.height = height0;
//     getImage.draw();
    }

//  Massstab bei Neuaufruf einblenden
    massstab(imgkey,img_zoomlevel[imgkey]);
  });

// eventViewboxChange
  img_element[imgkey]['drawing'].eventViewboxChange = function (x, y) {
    var trans = img_element[imgkey]['drawing'].getViewbox().getCTM();
    var scaleX = Math.sqrt(Math.pow(trans.getScaleX(), 2) + Math.pow(trans.getShearX(), 2));
//    var rotation=Math.round(Math.atan2(trans.getShearX(), trans.getScaleX())*180/Math.PI);
    var z = 0;
    while (img_zoomst[imgkey][z].width < img_zoomst[imgkey][0].width * scaleX && z < img_zoomst[imgkey].length - 1) {
        z++;
    }
    if (img_element[imgkey]['drawing'].getLayerBackground().getImage().getImage().src != img_zoomst[imgkey][z].url) {
      img_element[imgkey]['drawing'].setBackgroundImage(img_zoomst[imgkey][z].url, function () {
        if (z > 0) {
          var getImage = img_element[imgkey]['drawing'].getLayerBackground().getImage();
          var image = getImage.getImage();
          var width0 = img_zoomst[imgkey][0].width;
          var height0 = img_zoomst[imgkey][0].height;
//         image.setSize(width0, height0);
          image.width = width0;
          image.height = height0;
          getImage.geometry_.width = width0;
          getImage.geometry_.height = height0;
//         getImage.draw();
        }
      });
    }

    if (scaleX != img_zoomlevel[imgkey]) {
      if (typeof timeoutHandle_store_only != 'undefined') {
        clearTimeout(timeoutHandle_store_only[imgkey]);
        timeoutHandle_store_only[imgkey] = setTimeout(function () {
          $.ajax("?sid=" + sid + "&store_only=1&zoomlevel=" + scaleX);
        }, 1000);
      }
//    Slider aktualisieren
      setSliders(imgkey,scaleX);
//    Maßstab aktualisieren
      massstab(imgkey, scaleX);

      img_zoomlevel[imgkey] = scaleX;
    }

//  Thumb aktualisieren
    if (thumbexist) {
      navigationThumb(img_element[imgkey]['thumb'],img_element[imgkey]['drawing']);
    }
  }

// eventShapeHoverIn
  img_element[imgkey]['drawing'].eventShapeHoverIn = function (shapes) {
    if ($.isArray(shapes)) {
        shapes.forEach(function (s) {
          var shapeid = s.id;
          if (shapeid) {
            $('#' + shapeid).addClass('annostatus-active');
          }
/*          else {
            $('.annopanel-group').addClass('annostatus-active');
          } */
        });
    } 
  }

// eventShapeHoverOut
  img_element[imgkey]['drawing'].eventShapeHoverOut = function (shapes) {
    if ($.isArray(shapes)) {
      shapes.forEach(function (s) {
        var shapeid = s.id;
        if (shapeid) {
          $('#' + shapeid).removeClass('annostatus-active');
        }
/*        else {
          $('.annopanel-group').removeClass('annostatus-active');
        } */
      });
    }
  }

// Meta-Spalten-Button => resize
  $('#metaclickleft').on('click', function () {
    setOptimalCanvasSize(imgkey);
    img_element[imgkey]['drawing'].handleResize();
  });
  $('#metaclickright').on('click', function () {
    setOptimalCanvasSize(imgkey);
    img_element[imgkey]['drawing'].handleResize();
  });
} // Ende imginit

function handleResizeChanged(imgkey) {
  if (typeof img_element[imgkey] != 'undefined' && typeof img_element[imgkey]['drawing'] != 'undefined') {
    setOptimalCanvasSize(imgkey);
    img_element[imgkey]['drawing'].handleResize();
  }
}

function setSliders(imgkey,scaleX) {
  var sliderMax = 4;
  var sliderMin = .5;
  var sliderRel = 100 * (scaleX - sliderMin) / (sliderMax - sliderMin);
  if (sliderRel < 0) sliderRel = 0;
  if (sliderRel > 100) sliderRel = 100;
  if (typeof img_element[imgkey]['sliders'] != 'undefined') {
    if ($.isArray(img_element[imgkey]['sliders'])) {
      img_element[imgkey]['sliders'].forEach(function (element) {
        $('#'+element).slider("option","value",scaleX);
      });
    }
  }
}

function drawThumb(imgkey,vis) {
// Erzeugen des Canvas-Elements für Orientierungsthumb
  var thumbexist = 0;
  if ($('#tC_'+imgkey).length) {
    thumbexist = 1;
    if (typeof(Cookies) != 'undefined' && Cookies.get('navThumb') == '0') {
      $('.thumbCanvas').hide();
      $('.thumbEye').hide();
      return;
    }
  }
  if (thumbexist && img_element[imgkey]['thumb'].getEngine().isAvailable() && ($('#tab_image:visible').length || vis)) {
    img_element[imgkey]['thumb'].setBackgroundImage('/' + digipath + '/' + projectname + '/' + pagename + '/_thumb_image', function () {
      img_element[imgkey]['thumb'].setModeDisabled();
      img_element[imgkey]['thumb'].getViewbox().fit(true);
      img_element[imgkey]['thumb'].draw();
      $('#tE_'+imgkey).on("click", function (e) {
        toggleNavigationThumb(imgkey);
      });
      navigationThumb(img_element[imgkey]['thumb'],img_element[imgkey]['drawing'])
    });
  } 
}

function redrawThumb(imgkey) {
// wird aufgerufen, wenn auf Faksimile-Tab gewechselt wird
  $('#tC_'+imgkey).show();
  img_element[imgkey]['thumb'].handleResize();
  drawThumb(imgkey,1);
}

function toggleCanvasHeight(imgkey) {
  if (dispsize == 2) {
    dispsize = 1;
    $('.canvassize_'+imgkey+' span.fa-compress').removeClass('fa-compress').addClass('fa-expand');
  }
  else {
    dispsize = 2;
    $('.canvassize_'+imgkey+' span.fa-expand').removeClass('fa-expand').addClass('fa-compress');
  }
  $.ajax("?sid="+sid+"&store_only=1&dispsize="+dispsize);
  setOptimalCanvasSize(imgkey);
  img_element[imgkey]['drawing'].handleResize();
  img_element[imgkey]['thumb'].handleResize();
  drawThumb(imgkey,1);
}

function drawAllPolygons(annotations,active,csspraefix,displayopt) {
  if (typeof img_element == 'object') {
    for (var key in img_element) {
      drawPolygons(key,annotations,active,csspraefix,displayopt);
    }
  }
}

function drawPolygons(imgkey,annotations,active,csspraefix,showannozones) {
  var version_svg_polygon = '';

  img_element[imgkey]['drawing'].getLayerShape().removeShapes();

// OCR-Highlighting
  var ocrcolor = '#A00000';
  var style_ocr = new xrx.shape.Style();
  style_ocr.setFillColor(ocrcolor);
  style_ocr.setFillOpacity(0.3);
  style_ocr.setStrokeColor(ocrcolor);
  style_ocr.setStrokeWidth(0);
  if (typeof (zonecolor) == 'object' && zonecolor.length > 3) {
    ocrcolor = '#' + zonecolor[1];
  }
  drawShape('polygon', 'ocr-highlight', ocrhighlight, img_element[imgkey]['drawing'], style_ocr, imgkey);

  if (showannozones == 2) {
    img_element[imgkey]['drawing'].draw();
    return;
  }

// Polygone zu aktueller Version der Annotation
  var annocolor = '#A00000';
  var annocolorold = '#0000A0';
  if (typeof (zonecolor) == 'object' && zonecolor.length > 3) {
    annocolor = '#' + zonecolor[2];
    annocolorold = '#' + zonecolor[3];
  }
  var style_active = new xrx.shape.Style();
  style_active.setFillColor(annocolor);
  style_active.setFillOpacity(0.2);
  style_active.setStrokeColor(annocolor);
  style_active.setStrokeWidth(2);
  var style_all = new xrx.shape.Style();
  style_all.setFillColor(annocolor);
  style_all.setFillOpacity(0);
  style_all.setStrokeColor(annocolor);
  style_all.setStrokeWidth(2);
  var style_null = new xrx.shape.Style();
  style_null.setFillColor(annocolor);
  style_null.setFillOpacity(0);
  style_null.setStrokeColor(annocolor);
  style_null.setStrokeWidth(0);
  var style_old = new xrx.shape.Style();
  style_old.setFillColor(annocolorold);
  style_old.setFillOpacity(0.2);
  style_old.setStrokeColor(annocolorold);
  style_old.setStrokeWidth(2);
  var style_child = new xrx.shape.Style();
  style_child.setFillColor('#ffcc33');
  style_child.setFillOpacity(0.2);
  style_child.setStrokeColor('#ffcc33');
  style_child.setStrokeWidth(2);
  var style_child_null = new xrx.shape.Style();
  style_child_null.setFillColor('#ffcc33');
  style_child_null.setFillOpacity(0);
  style_child_null.setStrokeColor('#ffcc33');
  style_child_null.setStrokeWidth(0);

// jede Annotation...
  for (var key in annotations) {
    if (typeof annotations[key] != 'undefined') {
      var value = annotations[key];

      if (value.id == active && version_svg_polygon == '') {
        if (typeof(value.shown_version_polygons) != 'undefined') {
          version_svg_polygon = value.shown_version_polygons;
        }
      }

      if (typeof value.svg_polygon != 'undefined') {
//      Anzeige-Stil
        var style = style_null;
        if ($('#' + value.clean_svname).hasClass('annostatus-active')) {
//        aktive Annotation
          style = style_active;
        }
        else {
          if (showannozones == 1) {
//          Solle alle Annotationen angezeigt werden?
            style = style_all;
          }
//        Default: Polygon ohne Hervorhebung (nur für Hover-Event) zeichnen
        }

//      Einzelne Polygone zu der jew. Annotation zu Gruppe zusammenfassen
        var group = [];
        polygons = value.svg_polygon.split('<end>');
        for (var key2 in polygons) {
          var value2 = polygons[key2];
          if (typeof value2 != 'undefined' && value2.length > 0 && value2 !== 'undefined') {
            group.push(JSON.parse('[' + value2 + ']'));
          }
        }
        if (group.length) {
          drawShape('polygon', value.clean_svname, group, img_element[imgkey]['drawing'], style, imgkey);
        }
      }
//    Polygone zu untergeordneten Annotationen
      if ($.isArray(value.children)) {
        for (var ckey in value.children) {
          if (typeof(value.children[ckey]) != 'undefined') {
            var cvalue = value.children[ckey];
            if (cvalue.type == 'annotation' && typeof cvalue.svg_polygon != 'undefined') {
//            Anzeige-Stil
              var style = style_child_null;
              if ($('#' + cvalue.clean_svname).hasClass('annostatus-active')) {
//              aktive Annotation
                style = style_child;
              }
//            Default: Polygon ohne Hervorhebung (nur für Hover-Event) zeichnen
              var group = [];
              cpolygons = cvalue.svg_polygon.split('<end>');
              for (var ckey2 in cpolygons) {
                var cvalue2 = cpolygons[ckey2];
                if (typeof cvalue2 != 'undefined' && cvalue2.length > 0 && cvalue2 !== 'undefined') {
                  group.push(JSON.parse('[' + cvalue2 + ']'));
                }
              }
              if (group.length) {
                drawShape('polygon', cvalue.clean_svname, group, img_element[imgkey]['drawing'], style, imgkey);
              }
            }
          }
        }
      }
    }
  }

// Polygone zu alter Version zeichnen 
  if (version_svg_polygon && version_svg_polygon != '<end>') {
    var group = [];
    polygons = version_svg_polygon.split('<end>');
    for (var key2 in polygons) {
      var value2 = polygons[key2];
      if (typeof value2 != 'undefined' && value2.length > 0 && value2 !== 'undefined') {
        group.push(JSON.parse('[' + value2 + ']'));
      }
    }
    if (group.length) {
      drawShape('polygon', '', group, img_element[imgkey]['drawing'], style_old, imgkey);
    }
  }
}

function drawShape (type, polygonID, group, drawingCanvas, style, imgkey) {
  var shapegroup = new xrx.shape.ShapeGroup(drawingCanvas);
  shapegroup.setStyle(style);
  var hstyle = new xrx.shape.Style();;
  hstyle.setStrokeColor(style.getStrokeColor());
  hstyle.setStrokeWidth(2);
  hstyle.setFillColor(style.getFillColor());
  hstyle.setFillOpacity(0.2);
  shapegroup.getHoverable().setStyle(hstyle);
  shapegroup.id = polygonID;

  var polygons = [];
  for (var i = 0; i < group.length; i++) {
    var polygon = new xrx.shape.Polygon(drawingCanvas);
    polygon.setCoords(coordRel2Abs(group[i], img_zoomst[imgkey][0].width));
    polygon.id = polygonID;
    polygons.push(polygon);
  }
  shapegroup.addChildren(polygons);
  img_element[imgkey]['drawing'].addShapes(shapegroup);
}

/* Lagenstruktur */
function lagenToggle(sid) {
  if ($('#lagenAnzeige').is(':visible')) {
    $('#lagenAnzeige').hide();
    $('#lagenAnzeigeOff').show();
    if (sid) {$.ajax("?sid="+sid+"&store_only=1&showquire=0")}
  }
  else {
    $('#lagenAnzeige').show();
    $('#lagenAnzeigeOff').hide();
    if (!lageninit) {lagenInit()}
    if (sid) {$.ajax("?sid="+sid+"&store_only=1&showquire=1")}
  }
}

$.fn.lagenMenu = function (settings) {
  return this.each(function () {
      $(this).on("click", function (e) {
        var type = '';
        var wz = 0;
        for (var i = 0; i <= e.target.classList.length; i++) {
          if (e.target.classList[i] == 'page' || e.target.classList[i] == 'bifolium' || e.target.classList[i] == 'leaf') {type=e.target.classList[i]}
        }
        if (type == 'bifolium') {
          var w = $(this).innerWidth();
          var o = e.offsetX;
          var i = 0;
          if (o > w/2) {i = 1}
          var j = 0;
          if ($(this).children('.leaf').eq(i).hasClass('wm')) {wz = 1}
          $(this).children('.leaf').eq(i).children('span.page').each(function() {
            $('#lagenMenu').find('li a').eq(j).html($(this).html());
            $('#lagenMenu').find('li a').eq(j).attr('href',$(this).attr('data-page'));
            j++;
          });
        }
        else {
          var j = 0;
          if ($(e.target).closest('.leaf').hasClass('wm')) {wz = 1}
          $(e.target).closest('.leaf').children('span.page').each(function() {
            $('#lagenMenu').find('li a').eq(j).html($(this).html());
            $('#lagenMenu').find('li a').eq(j).attr('href',$(this).attr('data-page'));
            j++;
          })
        }
//      Wasserzeichen-Hinweis?
        if (wz) {$('.lMwz').show()}
        else {$('.lMwz').hide()}
//      Hinweis auf fehlendes Blatt?
        if ($('#lagenMenu').find('li a').eq(0).html().length) {
          $('.lMgz').show();
          $('.lMnv').hide();
        }
        else {
          $('.lMgz').hide();
          $('.lMnv').show();
        }

        var $menu = $(settings.menuSelector)
          .show()
          .css({
             position: "absolute",
             left: getMenuPosition(e.clientX, 'width', 'scrollLeft', 'left'),
             top: getMenuPosition(e.clientY, 'height', 'scrollTop', 'top')
          })
          .off('click')
          .on('click', 'a', function (e) {
             $menu.hide();
             var $selectedMenu = $(e.target);
             settings.menuSelected.call(this, $selectedMenu);
          });
          return false;
      });
      $('body').click(function () {
        $(settings.menuSelector).hide();
      });
  });
  
  function getMenuPosition(mouse, direction, scrollDir, offset) {
      var contentoffset = $('#content').offset();
      var win = $(window)[direction](),
          scroll = $(window)[scrollDir](),
          menu = $(settings.menuSelector)[direction](),
          position = mouse + scroll - contentoffset[offset];
      if (mouse + menu > win && menu < mouse) 
          position -= menu;
      return position;
  }    
}

function lagenInit () {
  lageninit = 1;
// Wasserzeichen => class 'wm'
  if ($.isArray(watermarks)) {
    var i;
    for (i = 0; i < watermarks.length; ++i) {
      var wmpage = '000'+watermarks[i];
      wmpage = wmpage.substring(wmpage.length - 4);
      $('span.page[data-page='+wmpage+']').parent('.leaf').addClass('wm');
    }
  }

  $('<div style="clear: both;"></div>').insertAfter('.gathtype');

  $('.leaf').each(function() {
/*    var t = $(this).children('span.page').eq(0).html();
    if ($(this).children('span.page').eq(1).html().length) {
      if (t.length) {t+='/'}
      t+=$(this).children('span.page').eq(1).html();
    } 
    if (t.length) {$(this).tooltip({title:t})} */
    if (!$(this).parent('.bifolium').length) {
      $(this).addClass('solo');
    }
    for (var i = 0; i <= 1; i++) {
      var grenze = 7;
      if ($(this).parent('.bifolium').eq(0).innerHeight() < 55) {grenze = 5}
      if ($(this).children('span.page').eq(i).html().length > grenze) {
        var s = $(this).children('span.page').eq(i).html().substring(0,grenze)+'...';
        $(this).children('span.page').eq(i).html(s);
        if ($(this).parent('.bifolium').eq(0).innerHeight() < 65) {$(this).children('span.page').eq(i).css('font-size','10px')}
      }
      if ($(this).hasClass('wm')) {
        var s = $(this).children('span.page').eq(i).html();
        $(this).children('span.page').eq(i).html('<i class="fa fa-shield"></i> '+s);
      }
    }
    if (vor_falz($(this))) {
      $(this).children('span.page').eq(1).addClass('vis');
    }
    else {
      $(this).children('span.page').eq(0).addClass('vis');
    }
    if ($(this).children('span.page[data-page='+pagename+']').length) {
      $(this).addClass('active');
      $(this).children('span.page[data-page='+pagename+']').eq(0).addClass('active');
      if (vor_falz($(this))) {
        $(this).parent('.bifolium').eq(0).addClass('left');
      }
      else {
        $(this).parent('.bifolium').eq(0).addClass('right');
      }
    }
    if ($(this).hasClass('missing')) {
      if (vor_falz($(this))) {
        $(this).parent('.bifolium').eq(0).addClass('left0');
      }
      else {
        $(this).parent('.bifolium').eq(0).addClass('right0');
      }
    }
  });
  lagenCorr(); 
  $(window).resize(function() {lagenCorr()});
  $('.gathering').each(function() {
    var w = $(this).innerWidth()-10;
    $(this).css('width',w);
    $(this).addClass('item');
  });
  var pos = 0;
  if ($('div.leaf.active').length) {
    pos = $('.gathering').index($('div.leaf.active').parents('.gathering'));
  }
  $('#lagencarousel').owlCarousel({
    margin:5,
//  loop:true,
    nav:true,
    navRewind:true,
    dots:true,
    autoWidth:true,
    items:1,
    navText:['<span class="glyphicon glyphicon-arrow-left"></span>','<span class="glyphicon glyphicon-arrow-right"></span>'],
    startPosition:pos,
  });
  $(".bifolium").lagenMenu({
    menuSelector: "#lagenMenu",
/*    menuSelected: function (selectedMenu) {
      var msg = "You selected the menu item '" + selectedMenu.text();
      alert(msg);
    } */
  });
  $(".leaf.solo").lagenMenu({
    menuSelector: "#lagenMenu",
/*    menuSelected: function (selectedMenu) {
      var msg = "You selected the menu item '" + selectedMenu.text();
      alert(msg);
    } */
  });
}

function vor_falz (p) {
  if (p.parent('.bifolium').hasClass('added')) {
    if (p.nextAll('.bifolium.added').eq(0).length) {return 1}
    if (!p.nextAll('.bifolium.added').eq(0).length && !p.prevAll('.bifolium.added').eq(0).length) {
      if (p.next('.leaf').length) {return 1}
    }
  }
  else {
    if (p.nextAll('.bifolium').not('.added').eq(0).length) {return 1}
    if (!p.nextAll('.bifolium').not('.added').eq(0).length && !p.prevAll('.bifolium').not('.added').eq(0).length) {
      if (p.next('.leaf').length) {return 1}
    }
  }
  return 0;
}

function lagenCorr () {
//für jedes zusätzliche Blatt, jede zusätzliche Lage
  $('.leaf.added, .bifolium.added').each(function() {
//  mehrere ineinandergeschaltelte .bifolium.added: nur äußerstes bearbeiten
    var skip = 0;
    if ($(this).hasClass('bifolium')) {
      if ($(this).parent().hasClass('added')) {skip = 1}
    }
    if (skip == 0) {
      var w = $(this).outerWidth(true);
//    vor nächstem Doppelblatt eingefügt oder danach?        
      var sign='-';
//      if ($(this).nextAll('.bifolium').not('.added').eq(0).length) {sign = "+"}
      if (vor_falz($(this))) {sign='+'}
      var offset = 0;
      if ($(this).parent('.bifolium').attr('data-offset')) {
        offset = parseInt($(this).parent('.bifolium').attr('data-offset'));
      }
      if (sign == '-') {offset -= w}
      else {offset += w}
      $(this).parent('.bifolium').attr('data-offset',offset);
    }
  }); 
  $('.bifolium[data-offset]').each(function() {
    var offset = $(this).attr('data-offset');
    $(this).parent('.bifolium').each(function() {
      if (!$(this).attr('data-offset')) {
        $(this).attr('data-offset',offset);
      } 
    });
  });
//alle Lagen mit Einfügungen korrigieren 
  $('.gathering').has('.bifolium[data-offset]').each(function() {
    $(this).find('.bifolium').each(function() {
      var iW = $(this).innerWidth();
      var bposnorm = iW/2-400;
      var offset = 0;
      if ($(this).attr('data-offset')) {offset = parseInt($(this).attr('data-offset'))}
      var bposcorr = bposnorm+Math.round(offset/2);
      $(this).css('background-position',bposcorr+'px 0');
    });
  });
}
