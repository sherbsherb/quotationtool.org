const copyContainer = $('#copy-container');
let copyContainerHideTimer;
let divElsName; // area we we may paste element

// ACTION: get the whole data from mySQL in one shot with get_all_SQL_as_arr_of_objects_in one_shot.php and distribut it into table on js side. That's easier for server and more control for data
/*
    // do it from myvocab

		$.ajax({
			type: 'POST',
			url: 'get_all_SQL_as_arr_of_objects_in one_shot.php',
			data: {},
			cache: false,
			success: function (data) {
				console.log(data);
				console.log('**********************');
				console.log($.parseJSON(data));
			},
		});
*/

// ACTIOIN: add new line in cost menu inside subtotal price and distribute it over all cost menues in proportion to prices
// ACTIOIN: hide columns
// ACTIOIN: When hover over Description, then show product menu from DB
// ACTIOIN: When type description, then search in db
// ACTIOIN: When hover over description, ask somehow to add into
// ACTION: remove class "fr-dvb" to make youtube playable, remove contenteditable="true" to make links clickable
// ACTION: $._data($(document).get(0), "events")- показывает включенные эвенты, постараться максимум выключатьa

// ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓ Cookie ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
function setCookie(CookieName, CookieValue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  var expires = 'expires=' + d.toUTCString();
  document.cookie = CookieName + '=' + CookieValue + ';' + expires + ';path=/';
}

function getCookie(CookieName) {
  var name = CookieName + '=';
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}

function checkCookie(CookieName) {
  var CookieValue = getCookie(CookieName);
  if (CookieValue != '') {
    return true;
  } else {
    return false;
  }
}

// ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓ Froala ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
let editor;

function initFroala() {
  //  fixed height to meke it less distorted
  $('.froala').each(function () {
    $(this).height($(this).height());
  });

  // if we do not destroyFroala before initFroala, Froala becomes laggy
  destroyFroala();

  editor = FroalaEditor('.froala', {
    fontSizeSelection: true,
    // enter: FroalaEditor.ENTER_BR,
    tabSpaces: 4,

    //https://froala.com/wysiwyg-editor/docs/options/#toolbarButtons
    toolbarButtons: {
      moreText: {
        buttons: [
          'fontSize',
          'textColor',
          'backgroundColor',
          '|',
          'bold',
          'italic',
          'underline',
          'strikeThrough',
          'subscript',
          'superscript',
          'fontFamily',
          'inlineClass',
          'inlineStyle',
          'clearFormatting',
        ],
        buttonsVisible: 3,
      },
      moreParagraph: {
        buttons: [
          'alignLeft',
          'alignCenter',
          'formatOLSimple',
          '|',
          'alignRight',
          'alignJustify',
          'formatOL',
          'formatUL',
          'paragraphFormat',
          'paragraphStyle',
          'lineHeight',
          'outdent',
          'indent',
          'quote',
        ],
        buttonsVisible: 3,
      },
      moreRich: {
        buttons: [
          'insertLink',
          'insertTable',
          'insertImage',
          'insertVideo',
          '|',
          'emoticons',
          'embedly',
          'fontAwesome',
          'specialCharacters',
          'insertFile',
          'insertHR',
        ],
        buttonsVisible: 4,
      },
      moreMisc: {
        buttons: [
          'undo',
          'redo' /*, 'fullscreen', 'print', 'getPDF', 'spellChecker', 'selectAll', 'html', 'help' */,
        ],
        align: 'right',
        buttonsVisible: 2,
      },
    },
    fontFamily: {
      Roboto: 'Roboto',
      Arial: 'Arial',
      Georgia: 'Georgia',
      Tahoma: 'Tahoma',
      Verdana: 'Verdana',
    },
    toolbarInline: true,
    placeholderText: 'Type text, drop files and pictures...',
    // https://froala.com/wysiwyg-editor/docs/concepts/image/upload/
    imageUploadURL: 'upload_image.php',
    fileUploadURL: 'upload_file.php',
    videoUploadURL: 'upload_video.php',
    // https://froala.com/wysiwyg-editor/docs/events/
    events: {
      // https://froala.com/wysiwyg-editor/docs/events/#image.removed
      'image.removed': function ($img) {
        // Do something here.
        console.log(this);
        console.log($img.attr('src'));
      },
      'paste.before': function () {
        console.log('paste before - froala');
        addToUndoArr();
      },
      // https://froala.com/wysiwyg-editor/docs/events/#paste.after
      'paste.after': function () {
        console.log('paste after - froala');
        addToUndoArr();
      },
    },
    key:
      'AVB8B-21D4B3B2E1F1G1uB-33B-21cyoF-10yB-7G-7gB-22zzE2wkA-7gC7B7D6B4E4F3D2I3H2C5==',
  });

  // remove fixed height
  setTimeout(() => {
    $('.froala').each(function () {
      $(this).height('');
    });
  }, 150);
}

function destroyFroala() {
  if (editor) {
    for (let i = 0; i < editor.length; i++) editor[i].destroy();
    editor = null;
  }
}

function cleanElFromFroala(el) {
  el.find('.froala').each(function () {
    $(this).html($(this).find('.fr-element').last().html());
  });
}

// ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓ VA ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
function dateTimeSQL(date = new Date()) {
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  if (month < 10) month = '0' + month;
  let day = date.getDate();
  if (day < 10) day = '0' + day;
  let hh = date.getHours();
  if (hh < 10) hh = '0' + hh;
  let mm = date.getMinutes();
  if (mm < 10) mm = '0' + mm;
  let ss = date.getSeconds();
  if (ss < 10) ss = '0' + ss;
  return year + '-' + month + '-' + day + ' ' + hh + ':' + mm + ':' + ss;
}

function dateSQL(date = new Date()) {
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  if (month < 10) month = '0' + month;
  let day = date.getDate();
  if (day < 10) day = '0' + day;
  return year + '-' + month + '-' + day;
}

function numbering() {
  let num = 0;
  $('.block-table tbody .row-no').each(function () {
    num = num + 1;
    $(this).text(num);
  });
}

function removeShadows(els) {
  // remove all 'shadow-*' classes from tr
  // https://stackoverflow.com/questions/2644299/jquery-removeclass-wildcard
  els.removeClass(function (index, className) {
    return (className.match(/(^|\s)shadow-\S+/g) || []).join(' ');
  });
}

function onlyNavVisible() {
  // dimmed is needed only for the first load, later it will be already hidden
  $('body')
    .children()
    .not('#nav-block, #dimmed, .info-footer, #copy-container')
    .not(':hidden')
    .hide();
}

function linkToClipboard(x) {
  var dummy = document.createElement('input');
  document.body.appendChild(dummy);
  dummy.setAttribute('value', x);
  dummy.select();
  document.execCommand('copy');
  document.body.removeChild(dummy);
  showFooterTemp('Link was copied to the clipboard');
}

function tempEventsOff() {
  if ($('#your-offers').is(':visible')) {
    $(document).off('click', '#your-offers .close'); //close offers window
    $(document).off('keydown', closeWindowAndShowCurOfferWithEsc); //close offers window with Esc
    $(document).off('click', '#your-offers table tbody .offer-open a'); //click on Open in offer table
    $(document).off(
      'mouseenter mouseleave',
      '#your-offers table tbody .offer-ver'
    ); //show vers in circles
    $(document).off('click', '#your-offers table tbody .vers'); //click on version circle
  } else if ($('#save-block').is(':visible')) {
    $(document).off('click', '#save-block .close'); // close save window
    $(document).off('keydown', closeWindowAndShowCurOfferWithEsc); //close offers window with Esc
    $(document).off('click', '#save-btn'); //save btn click
    $('#offer-comment').off(); // remove autoheight textarea
  } else if ($('#share-block').is(':visible')) {
    $(document).off('click', '#share-block .close'); // close save window
    $(document).off('keydown', closeWindowAndShowCurOfferWithEsc); //close offers window with Esc
    $(document).off('click', '#share-btn'); //save btn click
  } else if ($('#login-block').is(':visible')) {
    $(document).off('click', '#login-block .close'); // close save window
    $(document).off('keydown', closeWindowAndShowCurOfferWithEsc); //close offers window with Esc
    $(document).off('click', '#next'); //save btn click
  }
}

function closeWindowAndShowCurOffer() {
  tempEventsOff();
  onlyNavVisible();
  $('#all-without-nav').fadeIn();
}

function closeWindowAndShowCurOfferWithEsc(e) {
  if (e.keyCode == 27) {
    closeWindowAndShowCurOffer();
  }
}

function cleanEl(el) {
  cleanElFromFroala(el);
  removeShadows(el.children());
  el.find('.block, tr').removeClass('cursor-copy');
  el.find('.block, tr').removeClass('cursor-copy');
}

function cleanPageEl() {
  let tmp = $('#all-without-nav').clone();
  cleanElFromFroala(tmp);
  removeShadows(tmp.find('.block, tr'));
  tmp.find('.block, tr').removeClass('cursor-copy');
  return tmp;
}

function cleanPageElForCustomer() {
  let tmp = cleanPageEl();
  // remove sensitive info
  tmp.find('.row-price-menu, .bock-price-menu').remove();
  return tmp;
}

function showFooterTemp(message, duration = 3000) {
  const el = $('.info-footer-temp').first().clone().appendTo('body');
  el.text(message);
  el.show(() => el.addClass('show-info-temp'));

  setTimeout(() => {
    el.removeClass('show-info-temp');
    setTimeout(() => el.remove(), 300);
  }, duration);
}

// ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓ text and vals manipulation ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓

$.fn.toNum = function () {
  let a = parseFloat(this.text().replace(',', '.').replace(/\s/g, ''));
  if (isNaN(a)) a = 0;
  return a;
};

Number.prototype.toTxt = function (decimals = 'do not round') {
  // do not show zero or infinite or NaN
  if (!isFinite(this.valueOf())) return '';
  if (!this.valueOf()) return '';

  let a;
  if (decimals == 'do not round') {
    a = this.valueOf().toString();
  } else {
    a = this.valueOf().toFixed(decimals);
  }

  // do not show zeros in decimal part
  if (a.split('.').length == 2) {
    if (a.split('.')[1].length == 2 && a.split('.')[1].slice(-1) == '0')
      a = a.slice(0, -1);
    if (a.split('.')[1].slice(-1) == '0') a = a.slice(0, -2);
  }

  // separates thousands
  return a.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

function txtAfterVal(txt) {
  // go from the back of the string and check for the first number
  // return string, add space in front, replace all double spaces with one

  if (txt == '') return '';

  for (let i = txt.length - 1; i >= 0; i--) {
    let a = txt[i];
    a = parseInt(a);
    if (!isNaN(a)) {
      let result = txt.substring(i + 1, txt.length);
      result = result.trim();
      result = ' ' + "<span class='grey'>" + result + '</span>';
      return result;
    }
  }
  return txt;
}

// ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓ load ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
$(function () {
  fitNav();
  loadPageFromUrl();
  if (checkCookie('user_id')) $('#login').html('Logout');
});

// ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓ load offer from url ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
function paramFromUrl(paramName) {
  const url_string = window.location.href;
  const url = new URL(url_string);
  return url.searchParams.get(paramName);
}

// back - forward arrows in browser
let prevUrlId = null;
$(window).on('popstate', function () {
  addToUndoArr(prevUrlId); // save previous page url before changed by navigation buttons
  tempEventsOff();
  onlyNavVisible();
  loadPageFromUrl();
});

function addIdToUrl(id) {
  history.pushState(null, null, '?id=' + id); // change url + save in history
}

function loadPageFromUrl() {
  const offer_id = paramFromUrl('id');
  document.title = offer_id == null ? 'Template offer' : offer_id;
  prevUrlId = offer_id; // needed to store html in redoArr if we navigate with back-forward buttons
  $('#undo, #redo').addClass('not-clicable');

  if (typeof undoArr == 'undefined') {
    undoArr = [];
  } else {
    // need to load the latest offer if we hit the page by back/foward buttons
    for (let i = undoArr.length - 1; i >= 0; i--) {
      if (undoArr[i].id == offer_id) {
        // remove current tag from all elements
        undoArr.forEach(function (currentValue) {
          currentValue.current = false;
        });
        // put current tag to this one
        undoArr[i].current = true;
        // enable undo button if we have any offer with same ID previously in arr
        for (let j = i - 1; j >= 0; j--) {
          if (undoArr[j].id == offer_id) {
            $('#undo').removeClass('not-clicable');
            break;
          }
        }
        $('#all-without-nav').html(undoArr[i].html);
        // add copy pic to mouse pointer if we are in paste mode
        if (copyContainer.children().length)
          $(divElsName).addClass('cursor-copy');

        initFroala();
        $('#all-without-nav').fadeIn(400, function () {
          addToUndoArr();
        });
        return;
      }
    }
  }

  // if not loaded from undoArr, then go to DB
  if (offer_id == null) {
    onlyNavVisible();
    initFroala();
    $('#all-without-nav').fadeIn(400, function () {
      $('#dimmed').fadeOut(2000, function () {
        $(this).hide();
        addToUndoArr();
      });
    });
  } else {
    $.post(
      'load_offer_from_url.php',
      {
        offer_id: offer_id,
        user_id: getCookie('user_id'),
      },
      function (data) {
        if (data == 'no such offer') {
          alert('offer does not exist\nbasic template will be loaded');
          window.history.replaceState({}, document.title, '/'); //https://stackoverflow.com/questions/22753052/remove-url-parameters-without-refreshing-page
          loadPageFromUrl();
        } else if (data == 'expired') {
          alert(
            'offer expired\nask a sales manager to re-validate the offer\nbasic template will be loaded'
          );
          window.history.replaceState({}, document.title, '/'); //https://stackoverflow.com/questions/22753052/remove-url-parameters-without-refreshing-page
          loadPageFromUrl();
        } else if (data == 'offer is not shared') {
          alert(
            'offer exists, but not shared\nask a sales manager to share offer with you\nbasic template will be loaded'
          );
          window.history.replaceState({}, document.title, '/');
          loadPageFromUrl();
        } else {
          let arr = $.parseJSON(data);
          $('#all-without-nav').html(arr.offer_html);
          // add copy pic to mouse pointer if we are in paste mode
          if (copyContainer.children().length)
            $(divElsName).addClass('cursor-copy');
          initFroala();
          setCookie('offer_id', arr.offer_id, 45);
          $('#offer-letter-num').text(
            offer_id.slice(0, 5) + '-' + arr.offer_ver
          );
          $('#offer-name').val(arr.offer_name);
          $('#offer-to').val(arr.offer_to);
          $('#offer-price-no-vat').val(arr.offer_price_no_vat);
          $('#offer-comment').val(arr.offer_comment);
          $('#offer-order-date').val(arr.offer_order_date);
          $('#all-without-nav').fadeIn(400, function () {
            $('#dimmed').fadeOut(2000, function () {
              $(this).hide();
              addToUndoArr();
            });
          });
        }
      }
    );
  }
}

// ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓ leave the page ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
// reminder to save an offer
$(window).on('beforeunload', function () {
  // some other message is shown by browser, strange!
  return 'Are you sure you want to leave?';
});

// ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓ nav ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
function fitNav() {
  $('#nav a').show(); // show all to hide some of them after
  $('#humburger-btn, #humburger').hide(); // maybe all nav items fit and no need for hamburger
  $('#nav').css({ 'margin-right': '0px' }); // no hamburger and nav items may go to end

  // if nav items are not on one line, then hide one by one until they are on one line
  while (
    $('#nav a:visible').first().position().top !=
    $('#nav a:visible').last().position().top
  ) {
    $('#nav a:visible').last().hide();
    $('#nav').css({ 'margin-right': '50px' }); // leave some space for hamburger
    $('#humburger-btn, #humburger').show();
  }
}

$(window).on('resize', fitNav);

// hamburger click associated with input checkbox
$('#humburger-checkbox').on('change', function () {
  if (this.checked) {
    $('#all-without-nav').hide();
    $('#nav-mobile').html('');
    $('#nav a').clone().appendTo('#nav-mobile');
    $('#nav-mobile a:hidden').show(); // unhide cloned hidden items
    $('#nav-mobile-block').slideDown();
  } else {
    $('#nav-mobile-block').slideUp();
    $('#all-without-nav').show();
  }
});

// close #nav-mobile if we click any element inside
$('#nav-mobile').on('click', 'a', function () {
  $('#humburger-checkbox').click();
  // ACTION: open navigation element
  console.log('add function to open some window');
});

// ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓ Quotation tool ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
// ACTION: just open in new wndow --> this functionality move to "Current offer" menu
$('#nav-container-left').on('click', function (e) {
  e.preventDefault();
  tempEventsOff();
  onlyNavVisible();
  addToUndoArr(); // to save previous state before we jump to another offer
  history.pushState(null, null, 'http://quotationtool.org/');
  loadPageFromUrl();
});

// ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓ offers ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
$('#offers').on('click', function () {
  // do not run script if not loggin in ↓
  if (!checkCookie('user_id') || !checkCookie('user_mail')) {
    alert('Not logged in!');
    return;
  }

  // load offers ↓
  tempEventsOff(); // if we jump from other window need to disable some events
  onlyNavVisible(); // hide to gradually show later
  $('#your-offers table tbody').html(''); //otherwise prev state is visible
  $('#your-offers').fadeIn(); // gradually show
  $('#nav-mobile-block').slideUp();

  // close ↓
  $(document).one('click', '#your-offers .close', closeWindowAndShowCurOffer);

  // close if pressed ESC ↓
  $(document).on('keydown', closeWindowAndShowCurOfferWithEsc);

  // ajax request ↓
  $.post(
    'your_offers_table.php',
    {
      user_id: getCookie('user_id'),
      offer_id: paramFromUrl('id'), // for current offer highlight
    },
    function (data) {
      // if no data, do nothing, no need for event handlers
      if (data) {
        $('#your-offers-trs').html(data);

        //make blue circle for current version
        let htmlEl = '';
        const versEl = $('#your-offers-trs')
          .find('.current-offer-tr')
          .children('.offer-ver');
        for (let i = 1; i < versEl.toNum() + 1; i++) {
          let offerId = versEl.closest('tr').find('.offer-id').text() + i;
          if (i == parseFloat(paramFromUrl('id').slice(-1))) {
            htmlEl =
              htmlEl +
              "<a class='circle vers current-offer-circle' href='http://quotationtool.org/?id=" +
              offerId +
              "'>" +
              i +
              '</a>';
          } else {
            htmlEl =
              htmlEl +
              "<a class='circle vers' href='http://quotationtool.org/?id=" +
              offerId +
              "'>" +
              i +
              '</a>';
          }
        }
        versEl.html(htmlEl);

        // click on Open
        $(document).one(
          'click',
          '#your-offers table tbody .offer-open a',
          function (e) {
            e.preventDefault();
            addToUndoArr(); // to save previous state before we jump to another offer
            const trEl = $(this).closest('tr');
            const idMainPart = trEl.find('.offer-id').text();
            let idVerPart;
            if (trEl.find('.offer-ver').children().length) {
              idVerPart = trEl.find('.offer-ver').children().last().text();
            } else {
              idVerPart = trEl.find('.offer-ver').text();
            }
            const offerId = idMainPart + idVerPart;
            addIdToUrl(offerId);
            tempEventsOff();
            onlyNavVisible();
            loadPageFromUrl();
          }
        );

        // show round circles with versions
        $(document)
          .on('mouseenter', '#your-offers table tbody .offer-ver', function (
            e
          ) {
            if ($(this).find('.current-offer-circle').length) return; //do not replace circles for current offer
            let htmlEl = '';
            for (let i = 1; i < $(this).toNum() + 1; i++) {
              let offerId = $(this).closest('tr').find('.offer-id').text() + i;
              htmlEl =
                htmlEl +
                "<a class='circle vers' href='http://quotationtool.org/?id=" +
                offerId +
                "'>" +
                i +
                '</a>';
            }
            $(this).html(htmlEl);
          })
          .on('mouseleave', '#your-offers table tbody .offer-ver', function (
            e
          ) {
            if ($(this).find('.current-offer-circle').length) return; //do not remove circles for current offer
            $(this).html($(this).find('a').last().text());
          });

        // click on ver
        $(document).one('click', '#your-offers table tbody .vers', function (
          e
        ) {
          e.preventDefault();
          addToUndoArr(); // to save previous state before we jump to another offer
          const offer_id =
            $(this).closest('tr').find('.offer-id').text() + $(this).text();
          addIdToUrl(offer_id);
          tempEventsOff();
          onlyNavVisible();
          loadPageFromUrl();
        });
      }
    }
  );
});

// ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓ save ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
$('#save').on('click', function () {
  // do not run script if not loggin in ↓
  if (!checkCookie('user_id') || !checkCookie('user_mail')) {
    alert('Not logged in!');
    return;
  }

  // prepare data ↓

  // award date in 30 days
  if ($('#offer-order-date').val() == '')
    $('#offer-order-date').val(
      dateSQL(new Date(new Date().setDate(new Date().getDate() + 30)))
    );

  // pre-select radio button
  if ($('#offer-letter-num').text() == 'not saved') {
    $('#save-new-version').prop('checked', true);
  } else {
    $('#save-update').prop('checked', true);
  }

  // disable some radio buttons
  if ($('#offer-letter-num').text() == 'not saved') {
    $('#save-update, #save-next-version').attr('disabled', true);
  } else {
    $('#save-update, #save-next-version').attr('disabled', false);
  }

  // populate total price
  let price = 0;
  $('.price-without-tax-val').each(function () {
    let x = $(this).toNum();
    if (isNaN(x)) x = 0;
    price += x;
  });
  $('#offer-price-no-vat').val(price);

  // show menu ↓
  tempEventsOff();
  onlyNavVisible();
  $('#save-block').fadeIn();
  $('#nav-mobile-block').slideUp();

  // close with X ↓
  $(document).one('click', '#save-block .close', closeWindowAndShowCurOffer);

  // close with ESC ↓
  $(document).on('keydown', closeWindowAndShowCurOfferWithEsc);

  // save btn click ↓
  $(document).on('click', '#save-btn', function () {
    // new, update, template or next version
    let saveMode;
    if ($('#save-new-version').is(':checked')) {
      saveMode = 'new';
    } else if ($('#save-update').is(':checked')) {
      saveMode = 'update';
    } else if ($('#save-next-version').is(':checked')) {
      saveMode = 'next';
    } else if ($('#save-template').is(':checked')) {
      alert('under construction');
      // ACTION
      return;
    } else if ($('#save-public-template').is(':checked')) {
      alert('under construction');
      // ACTION
      return;
    }

    // get verion number from url
    const offer_ver =
      paramFromUrl('id') == null ? 1 : paramFromUrl('id').slice(-1);

    // ajax request ↓
    $.post(
      'save_offer.php',
      {
        offer_name: $('#offer-name').val(),
        offer_to: $('#offer-to').val(),
        offer_price_no_vat: $('#offer-price-no-vat').val(),
        offer_comment: $('#offer-comment').val(),
        offer_ver: offer_ver,
        offer_html: cleanPageEl().html(),
        offer_init_date: dateTimeSQL(),
        offer_update_date: dateTimeSQL(),
        offer_order_date: dateSQL(new Date($('#offer-order-date').val())),
        user_id: getCookie('user_id'),
        user_mail: getCookie('user_mail'),
        saveMode: saveMode,
        offer_id: paramFromUrl('id'),
      },
      function (data) {
        // if no data, do nothing
        if (data) {
          let arr = $.parseJSON(data);

          // update id on in offer's corner
          $('#offer-letter-num').text(
            arr.offer_id.slice(0, 5) + '-' + arr.offer_ver
          );

          // update url
          const offer_id =
            $(this).closest('tr').find('.offer-id').text() + $(this).text();
          addIdToUrl(arr.offer_id);

          // sucess message in footer
          if (saveMode == 'new') {
            showFooterTemp(
              'saved under id ' + arr.offer_id.slice(0, 5) + '-' + arr.offer_ver
            );
          } else if (saveMode == 'update') {
            showFooterTemp('updated');
          } else if (saveMode == 'next') {
            showFooterTemp('saved as new version - ' + arr.offer_ver);
          }

          // close
          closeWindowAndShowCurOffer();
        }
      }
    );
  });
});

// expand textarea on typying ↓
$('#offer-comment').on('input', function () {
  console.log("$('#offer-comment').on('input', function () {");
  if ($(this).val()) {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 2 + 'px';
  } else {
    this.style.height = 'auto';
  }
});

// ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓ share ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
$('#share').on('click', function () {
  // do not run script if not loggin in ↓
  if (!checkCookie('user_id') || !checkCookie('user_mail')) {
    alert('Not logged in!');
    return;
  }

  // do not run script if offer is not saved ↓
  if ($('#offer-letter-num').text() == 'not saved') {
    alert('Save offer first');
    return;
  }

  // close with X ↓
  $(document).one('click', '#share-block .close', closeWindowAndShowCurOffer);

  // close with ESC ↓
  $(document).on('keydown', closeWindowAndShowCurOfferWithEsc);

  // expiry date in 30 days ↓
  $('#expires-in').text('Expires');
  if ($('#share-expiry-date').val() == '')
    $('#share-expiry-date').val(
      dateSQL(new Date(new Date().setDate(new Date().getDate() + 30)))
    );

  // show menu ↓
  tempEventsOff();
  onlyNavVisible();
  $('#shared-link').hide(); // it might be visible from prev savings
  $('#share-btn').text('Share'); // there might be "update" state from prev savings
  $('#share-block').fadeIn();
  $('#nav-mobile-block').slideUp();

  // check if offer is already shared ↓
  $.post(
    'is_offer_shared.php',
    {
      offer_id: paramFromUrl('id'),
    },
    function (data) {
      // if no data, do nothing
      if (data) {
        let arr = $.parseJSON(data);

        // show link if offer is shared ↓
        $('#shared-link').show();
        $('#shared-link').attr('href', arr.offer_link);
        $('#shared-link').text(arr.offer_link);

        // we can modify some data and update
        $('#share-btn').text('Update');

        // expiries in ↓
        $('#share-expiry-date').val(arr.offer_expiry_date);
        $('#expires-in').text('Expires in ' + arr.days_dif + ' days');
      }
    }
  );

  // click on share button ↓
  $(document).one('click', '#share-btn', function () {
    // ajax request ↓
    $.post(
      'share_offer.php',
      {
        offer_html: cleanPageEl().html(),
        offer_html_shared: cleanPageElForCustomer().html(),
        offer_update_date: dateTimeSQL(),
        offer_shared_date: dateTimeSQL(),
        offer_expiry_date: dateSQL(new Date($('#share-expiry-date').val())),
        user_id: getCookie('user_id'),
        offer_id: paramFromUrl('id'),
      },
      function (data) {
        // if no data, do nothing
        if (data) {
          let arr = $.parseJSON(data);

          // expires in ↓
          $('#expires-in').text('Expires in ' + arr.days_dif + ' days');

          // show and copy link ↓
          $('#shared-link').show();
          $('#shared-link').attr('href', arr.offer_link);
          $('#shared-link').text(arr.offer_link);
          linkToClipboard(arr.offer_link);

          // close
          closeWindowAndShowCurOffer();
        }
      }
    );
  });
});

// ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓ undo-redo  ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓

function addToUndoArr(offerId = paramFromUrl('id')) {
  if (undoArr.length) {
    // find position of .current html and move it to the end of array
    // (needed if we undid and start to modify text, then those undid state becomes last one in array)
    for (let i = 0; i <= undoArr.length - 1; i++) {
      if (undoArr[i].current) {
        undoArr[i].current = false;
        undoArr.push(undoArr.splice(i, 1)[0]);
        break;
      }
    }

    // add new current html to the end of array
    undoArr.push({
      current: true,
      id: offerId,
      html: cleanPageEl().html(),
    });

    // if 2 close last elements are same, delete previous one
    let lastNum = undoArr.length - 1;
    for (let i = lastNum - 1; i >= 0; i--) {
      // find previous offer with same id
      if (undoArr[lastNum].id == undoArr[i].id) {
        // if content is the same, then delete it
        if (undoArr[lastNum].html == undoArr[i].html) {
          console.log('deleted previous same el from undoArr');
          undoArr.splice(i, 1);
        }
        // we need just to check the last 2 elements from same offer
        break;
      }
    }

    // keep last 30 states --> if we are 31 rows, remove the first one
    if (undoArr.length > 30) undoArr = undoArr.slice(1);

    // disable Redo button
    $('#redo').addClass('not-clicable');

    // blink with white
    $('#undo').addClass('white'); // blink with white
    setTimeout(() => {
      $('#undo').removeClass('white');
    }, 150);

    // if elements with same id is more than 1, enable undo
    $('#undo').addClass('not-clicable');
    lastNum = undoArr.length - 1;
    for (let i = lastNum - 1; i >= 0; i--) {
      if (undoArr[lastNum].id == undoArr[i].id) {
        $('#undo').removeClass('not-clicable');
        break;
      }
    }

    // start to count 10 characters to save html in next array cell
    undoCounter = 0;
  } else {
    undoArr.push({
      current: true,
      id: offerId,
      html: cleanPageEl().html(),
    });
  }
}

// save state in undo arr every 10 keyboard strokes
let undoCounter = 0;
$(document).on('keydown', '#all-without-nav', function (e) {
  undoCounter++;
  //save every 11th change
  if (undoCounter > 10) {
    // get keycode of current keypress event
    let code = e.keyCode || e.which;
    // keyCodes for special keys like arrows, ALT, CTRL, F1, ESC...
    const specialKyes = [
      37,
      38,
      39,
      40,
      35,
      36,
      33,
      34,
      27,
      112,
      113,
      114,
      115,
      116,
      117,
      118,
      119,
      120,
      121,
      122,
      123,
      16,
      17,
      91,
      18,
      173,
      174,
      175,
      144,
      8,
      46,
    ];
    // do nothing anything if it's an arrow key
    if (specialKyes.includes(code)) return;
    // save html in array
    addToUndoArr();
  }
});

// delete and backspace not working for froala for keydown, maybe due to froala js
// but it works on keyup
$(document).on('keyup', '#all-without-nav', function (e) {
  let code = e.keyCode || e.which;
  if (code == 8 || code == 46) addToUndoArr();
});

// ctrl+v ctrl+x copy paste with mouse
// pasting in foala does not work, we handle it with froala event "paste.after"
$(document).on('paste cut', '#all-without-nav', function (e) {
  console.log('cut paste');
  // save state before
  addToUndoArr();
  // save state after
  setTimeout(() => addToUndoArr(), 500);
});

$('#undo').on('click', function () {
  const offerId = paramFromUrl('id');

  // go in array backwards
  for (let i = undoArr.length - 1; i >= 0; i--) {
    // find current offer with same id
    if (undoArr[i].current && undoArr[i].id == offerId) {
      // go further to find previous offer with same id
      for (let j = i - 1; j >= 0; j--) {
        if (undoArr[j].id == offerId) {
          // previous offer becomes current, current becomes not current
          undoArr[i].current = false;
          undoArr[j].current = true;

          // tempEventsOff();

          // gradually load html
          $('body').height($('body').height()); // to show scroll bar, otherwise page jumps to right
          onlyNavVisible();
          $('#all-without-nav').html(undoArr[j].html);

          $('#all-without-nav').fadeIn(400, () => $('body').height(''));
          initFroala();
          // we undid, now can redo
          $('#redo').removeClass('not-clicable');

          // disabled undo button if there are no offers with same id before
          $('#undo').addClass('not-clicable');
          for (let k = j - 1; k >= 0; k--) {
            if (undoArr[k].id == offerId) {
              $('#undo').removeClass('not-clicable');
              break;
            }
          }
          return;
        }
      }
    }
  }
});

$('#redo').on('click', function () {
  const offerId = paramFromUrl('id');

  // go in array backwards
  for (let i = 0; i <= undoArr.length - 1; i++) {
    // find current offer with same id
    if (undoArr[i].current && undoArr[i].id == offerId) {
      // go forward to find next offer with same id
      for (let j = i + 1; j <= undoArr.length - 1; j++) {
        if (undoArr[j].id == offerId) {
          // later offer becomes current, previous becomes not current
          undoArr[i].current = false;
          undoArr[j].current = true;

          //tempEventsOff();

          // gradually load html
          $('body').height($('body').height()); // to show scroll bar, otherwise page jumps to right
          onlyNavVisible();
          $('#all-without-nav').html(undoArr[j].html);

          $('#all-without-nav').fadeIn(400, () => $('body').height(''));
          initFroala();

          // we redid, now can undo
          $('#undo').removeClass('not-clicable');

          // disabled redo button, if there are no offers with same id further
          $('#redo').addClass('not-clicable');
          for (let k = j + 1; k <= undoArr.length - 1; k++) {
            if (undoArr[k].id == offerId) {
              $('#redo').removeClass('not-clicable');
              break;
            }
          }
          return;
        }
      }
    }
  }
});

// ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓ login / logout ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
$('#login').on('click', function (e) {
  if (!checkCookie('user_id')) {
    //show login inputs
    tempEventsOff();
    onlyNavVisible();
    $('#login-block').fadeIn();
    $('#nav-mobile-block').slideUp();
    $('#user_mail, #user_pass').val('');

    // close, click on X
    $(document).on('click', '#login-block .close', function () {
      // delete text from inputs on first X, close window on second click
      if ($('#user_mail').val() || $('#user_pass').val()) {
        $('#user_mail, #user_pass').val('');
        return;
      }

      closeWindowAndShowCurOffer();
    });

    // close with ESC ↓
    $(document).on('keydown', closeWindowAndShowCurOfferWithEsc);

    // log in ↓
    let wrongPass = 0;
    $(document).on('click', '#next', function () {
      // shake inputs if mail does not follow mail pattern
      var re = /[a-z0-9!#$%&'*+\/=?^_{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9][a-z0-9-]*[a-z0-9]/;
      if (
        re.test($('#user_mail').val().toLowerCase()) == false ||
        $('#user_mail').val() == '' ||
        $('#user_pas').val() == ''
      ) {
        $('.logpass')
          .addClass('shake')
          .delay(1000)
          .queue(function () {
            $(this).removeClass('shake');
            $(this).dequeue();
          });
        return;
      }

      // disable button until function is processed
      $('#next').css({ 'pointer-events': 'none', opacity: '0.3' });
      // ajax request
      $.post(
        'login.php',
        {
          user_mail: $('#user_mail').val().replace(/\s/g, ''), // global remove white spaces
          user_pass: $('#user_pass').val(),
        },
        function (data) {
          // enable button back
          $('#next').css({ 'pointer-events': 'auto', opacity: '1.0' });

          if (data) {
            wrongPass = 0;
            setCookie('user_id', data, 45);
            setCookie(
              'user_mail',
              $('#user_mail').val().trim().toLowerCase(),
              45
            );
            $('#login').html('Logout');
            $('#user_mail, #user_pass').val('');
            $('#login-block .close').trigger('click');
          } else {
            wrongPass = wrongPass + 1;
            if (wrongPass <= 3) {
              alert(
                'Failed ' +
                  wrongPass +
                  ' time(s). After 3 fails you can reset your password.'
              );
            } else {
              if (confirm('Reset password?')) {
                wrongPass = 0;
                alert('Temporary password will be mailed soon');
                $('#login-block .close').trigger('click');

                // ACTION: check function below
                /*
                                $.post('new_pass.php', {
                                    user_mail: $("#user_mail").val().trim()
                                }, function(data) {
                                    alert('Check your user_mail and spam box');
                                });
                            */
              }
            }
          }
        }
      );
    });
  } else {
    // logout
    wrongPass = 0;
    tempEventsOff();
    setCookie('user_id', 666, -1);
    setCookie('user_mail', 666, -1);
    $('#login').html('Login');
    closeWindowAndShowCurOffer();
  }
});

// ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓ add delete copy cut ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓

$(document).on('click', '.menu-pic', function (e) {
  e.stopPropagation(); // no need to trigger '$(document).on("mouseenter click", ".txt-container", function()'
  console.log('menuPic.on("click", function(e)');

  const menuPic = $(this);
  const block = menuPic.closest('tr, .block');
  const underLayer = $('#under-layer');
  const menu = $('#menu');

  // we may be in copy-pasting mode and wlick the menu to copy more
  // in such case no need to show copy container
  copyContainer.hide();

  // menu postion a bit to the right and down from click cursor
  menu.css({
    top: e.pageY + 10 + 'px',
    left: e.pageX + 10 + 'px',
  });

  // if inside TR, no need to show add button, because .add-line is needed only
  if ($(this).closest('tr').length) {
    menu.children().hide();
    menu.find('.copy-btn, .cut-btn, .delete-btn, .add-btn-line').show();
  }
  // if inside block, button has 3 add options
  else {
    menu.children().hide();
    menu.find('.copy-btn, .cut-btn, .delete-btn, .add-btn').show();

    // add button click
    // show different options for actions on blocks
    menu.one('click', '.add-btn', function (e) {
      e.stopPropagation();
      console.log('menu.one("click", ".add-btn", function(e) ');

      // show menu for adding txt/items/price
      if (!$(this).closest('tr').length) {
        menu.children().hide();
        menu.find('.add-btn-txt, .add-btn-items, .add-btn-price').show();
      }
    });
  }

  // show menu and underlayer, which is needed to close menu if we click outside the menu
  menu.show();
  underLayer.insertAfter(menu);
  underLayer.show();

  // highlight blocks, when hover over copy/cut/delete
  menu
    .on('mouseenter', '.default', function () {
      console.log('menu.on("mouseenter", ".default", function()');
      let className;
      if ($(this).hasClass('add-btn')) {
        className = 'shadow-blue-bottom';
      } else if ($(this).hasClass('delete-btn')) {
        className = 'shadow-red-all';
      } else if ($(this).hasClass('copy-btn')) {
        className = 'shadow-grey-all';
      } else if ($(this).hasClass('cut-btn')) {
        className = 'shadow-grey-all-low-opacity';
      }

      // highlight by applying the class
      block.addClass(className);
    })
    .on('mouseleave', '.default', function () {
      console.log('menu.on("mouseleave", ".default", function()');
      removeShadows(block);
    });

  // underlayer, no need to off, because anyway you have to do it by click
  underLayer.one('click', function (e) {
    e.stopPropagation();
    console.log('underLayer.one("click", function()');
    //removeShadows(block);
    underLayer.hide();
    menu.hide();
    menu.off(); // highlight blocks when hover over copy/cut/delete in menu
  });

  // on mouseenter show what will be added in real time, and then on click just apply it
  let copiedEl;
  menu
    .on(
      'mouseenter',
      '.add-btn-txt, .add-btn-items, .add-btn-price, .add-btn-line',
      function (e) {
        e.stopPropagation();
        console.log(
          'menu.on("mouseenter", ".add-btn-txt, .add-btn-items, .add-btn-price, .add-btn-line", function()'
        );
        if ($(this).hasClass('add-btn-txt')) {
          copiedEl = $('#txt-template').clone();
        } else if ($(this).hasClass('add-btn-line')) {
          copiedEl = $('#tr-template').clone();
        } else if ($(this).hasClass('add-btn-items')) {
          copiedEl = $('#boq-template').clone();
        } else if ($(this).hasClass('add-btn-price')) {
          copiedEl = $('#price-template').clone();
        }

        copiedEl.removeAttr('id');
        copiedEl.removeClass('hidden');
        copiedEl.insertAfter(block);
        copiedEl.addClass('shadow-green-all');
      }
    )
    .on(
      'mouseleave',
      '.add-btn-txt, .add-btn-items, .add-btn-price, .add-btn-line',
      function (e) {
        console.log(
          'menu.on("mouseleave", ".add-btn-txt, .add-btn-items, .add-btn-price, .add-btn-line", function(e)'
        );
        e.stopPropagation();
        copiedEl.remove();
      }
    );

  // add (block or TR)
  // it is already shown from the mouseenter, just leave it there
  menu.one(
    'click',
    '.add-btn-txt, .add-btn-items, .add-btn-price, .add-btn-line',
    function (e) {
      e.stopPropagation();
      console.log(
        'click on add btn - menu.one("click", ".add-btn-txt, .add-btn-items, .add-btn-price, .add-btn-line", function()'
      );
      cleanEl(copiedEl);

      // blink with green
      copiedEl.addClass('shadow-green-all');
      setTimeout(() => removeShadows(copiedEl), 500);

      if (copiedEl.hasClass('boq-block') || copiedEl.hasClass('row'))
        numbering();
      //blockPrices();
      addToUndoArr();
      if (copiedEl.hasClass('txt-block')) initFroala();

      // message
      showFooterTemp('added');
      // close
      underLayer.trigger('click');
    }
  );

  // delete
  menu.one('click', '.delete-btn', function (e) {
    e.stopPropagation();
    console.log(
      'click on delete btn - menu.one("click", ".delete-btn", function()'
    );

    // if no siblings, then its the last TR, do not delete it and shake
    const siblingEl = block.siblings().first();
    if (!block.siblings().length) {
      block
        .add(menu)
        .addClass('shake')
        .delay(1500)
        .queue(function () {
          $(this).removeClass('shake');
          $(this).dequeue();
          underLayer.trigger('click');
          showFooterTemp("can't delete last element");
        });
      return;
    }

    // treat TR differently to let it slideUp
    if (block.is('tr')) {
      block
        .children('td, th')
        .animate(
          { 'padding-top': '0px', 'padding-bottom': '0px', height: '0px' },
          300
        )
        .wrapInner('<div/>')
        .children()
        .slideUp(300);

      // if we do in promise of slideUp, then atction will be repeated many times as number of TDs
      block
        .children('td, th')
        .promise()
        .done(function () {
          block.remove();
          numbering();
          boqPrice(siblingEl);
          blockPrices();
          addToUndoArr();
          showFooterTemp('deleted');
          underLayer.trigger('click'); // close
        });
    } else {
      // remove block
      block.slideUp(300, () => {
        block.remove();
        numbering();
        boqPrice(siblingEl);
        blockPrices();
        addToUndoArr();
        showFooterTemp('deleted');
        underLayer.trigger('click'); // close
      });
    }
  });

  // copy cut
  menu.one('click', '.copy-btn, .cut-btn', function (e) {
    e.stopPropagation();

    console.log('menu.one("click", ".copy-btn, .cut-btn", function(e) ');

    // hide menu
    menu.hide();

    // show container next to the cursor
    copyContainer.css({
      top: 5 + e.pageY - $(window).scrollTop() + 'px',
      left: 20 + e.pageX - $(window).scrollLeft() + 'px',
    });
    copyContainer.show();

    // copy or cut + put in container + message
    if ($(this).hasClass('copy-btn')) {
      removeShadows(block);
      const copiedEl = block.clone();

      copiedEl.hide();
      copyContainer.append(copiedEl);

      if (block.is('tr')) {
        copiedEl
          .wrap('<div class="boq-block copied-row" style="display:none"></div>')
          .wrap('<table class="block-table"></table>');
        copiedEl.show();
      }

      copyContainer
        .children()
        .last()
        .slideDown(150, 'linear', function () {
          copyContainerHideTimer = setTimeout(
            () => copyContainer.fadeOut(300),
            700
          );
        });
      showFooterTemp('copied');
    } else if ($(this).hasClass('cut-btn')) {
      const cutEl = block.clone();
      const blockParentEl = block.parent(); // for boqPrice function
      removeShadows(cutEl);
      cutEl.hide();

      if (block.is('tr')) {
        // do not cut the last TR el
        if (!block.siblings().length) {
          block
            .add(menu)
            .addClass('shake')
            .delay(1500)
            .queue(function () {
              $(this).removeClass('shake');
              $(this).dequeue();
              underLayer.trigger('click');
              showFooterTemp("can't delete last element");
            });
          return;
        }

        block
          .children('td, th')
          .animate(
            { 'padding-top': '0px', 'padding-bottom': '0px', height: '0px' },
            300
          )
          .wrapInner('<div/>')
          .children()
          .slideUp(300);

        // if we do in promise of slideUp, then action will be repeated many times as number of TDs
        block
          .children('td, th')
          .promise()
          .done(function () {
            block.remove();
            underLayer.trigger('click');
            numbering();
            boqPrice(blockParentEl);
            blockPrices();
            addToUndoArr();
          });

        copyContainer.append(cutEl);
        cutEl
          .wrap('<div class="boq-block copied-row" style="display:none"></div>')
          .wrap('<table class="block-table"></table>');
        cutEl.show();
        copyContainer
          .children()
          .last()
          .slideDown(150, 'linear', function () {
            copyContainerHideTimer = setTimeout(
              () => copyContainer.fadeOut(300),
              700
            );
          });
        showFooterTemp('cut');
      } else {
        block.slideUp(300, function () {
          block.remove();
          underLayer.trigger('click');
        });

        copyContainer.append(cutEl);
        cutEl.slideDown(150, 'linear', function () {
          copyContainerHideTimer = setTimeout(
            () => copyContainer.fadeOut(300),
            700
          );
        });
        showFooterTemp('cut');
      }
    }

    let pasteEl;
    let allAreaName; // area, inside which we highlight insertion position

    function determinAreas() {
      // based on first el from the #copy-container determine areas
      pasteEl = $('#copy-container').children().first();

      // it is not an element, but string, because we delegate it later to Document
      // to be able to insert copied element into another offer
      if (pasteEl.hasClass('copied-row')) {
        divElsName = '.boq-block .block-table tbody tr';
        allAreaName = '.boq-block .block-table tbody';
      }
      else if (pasteEl.hasClass('block')) {
        divElsName = '#all-without-nav .block';
        allAreaName = '#all-without-nav';
      }
    }

    // we may copy element many times, but want to initiate events only ones
    // disable possible existing click events, and appy it after
    $(document).off('.copy_cut_namespace');

    // remove copy pic from cursor, determin new paste area, apply copy pic back
    $(divElsName).removeClass('cursor-copy');
    determinAreas();
    $(divElsName).addClass('cursor-copy');

    let insertTo; // will be used in 2 functions

    function removeShadowsFromDivEls(e) {
      e.stopPropagation();
      console.log('menuPic.on("mouseenter", function(e)');

      copyContainer.hide();
      removeShadows($(divElsName));
    }

    function paste(e) {
      e.stopPropagation();
      e.stopImmediatePropagation();
      // due to animation we need to wait for all code and disable paste click, otherwise
      // froala doesn't initiated properly

      // to prevent all other handlers
      $(document).off('.copy_cut_namespace');

      console.log(
        'insert block - $(document).on("click", divElsName, function()'
      );

      removeShadows($('tr, .block'));

      const firstElFromCopyContainer = copyContainer.children().first();

      // insert
      firstElFromCopyContainer.slideUp(300, () => {
        let pastingEl;
        let tdPaddingTop, tdPaddingBottom, tdHeight, tdFontSize;

        // paste block or TR gradually
        // for TR we use animate, because table is a strange thing
        // here we do preparation
        if (firstElFromCopyContainer.hasClass('copied-row')) {
          pastingEl = firstElFromCopyContainer.find('tr').clone();

          tdPaddingTop = firstElFromCopyContainer.find('td').css('padding-top');
          tdPaddingBottom = firstElFromCopyContainer
            .find('td')
            .css('padding-bottom');
          tdHeight = firstElFromCopyContainer.find('td').css('height');
          tdFontSize = firstElFromCopyContainer.find('td').css('font-size');

          pastingEl.find('td').css({
            'padding-top': '0px',
            'padding-bottom': '0px',
            height: '0px',
            'font-size': '0',
          });
        }
        // for block will just slidDown
        else {
          pastingEl = firstElFromCopyContainer.clone();
        }

        cleanEl(pastingEl);
        pastingEl.addClass('shadow-green-all');
        setTimeout(() => removeShadows(pastingEl), 700);

        switch (insertTo) {
          case 'Above':
            pastingEl.insertBefore($(this));
            break;
          case 'VeryTop':
            $(this).parent().prepend(pastingEl);
            break;
          case 'Under':
            pastingEl.insertAfter($(this));
            break;
          case 'Middle':
            $(this).replaceWith(pastingEl.show());
            break;
        }

        // animate TR
        if (firstElFromCopyContainer.hasClass('copied-row')) {
          pastingEl.find('td').animate(
            {
              'padding-top': tdPaddingTop,
              'padding-bottom': tdPaddingBottom,
              height: tdHeight,
              'font-size': tdFontSize,
            },
            300
          );

          // when animation is finnished, remove style in html, which is left after animation
          $.when(pastingEl.find('td').promise()).done(function () {
            pastingEl.find('td').removeAttr('style');
          });
        }
        // slidDown block
        else {
          pastingEl.slideDown(300);
        }

        firstElFromCopyContainer.remove();

        $(divElsName).removeClass('cursor-copy');
        numbering();
        boqPrice(pastingEl);
        blockPrices();
        addToUndoArr();

        // if copyContainer is not empty, re-determin paste areas and re-apply listeners
        if (copyContainer.children().length) {
          // re-determine areas
          determinAreas();
          // add copy pic to cursor
          $(divElsName).addClass('cursor-copy');
          // after area re-dertermination we need to re-launch all event handlers
          $(document).on(
            'mousemove.copy_cut_namespace',
            divElsName,
            whereToPaste
          );
          $(document).on(
            'mouseleave.copy_cut_namespace',
            allAreaName,
            leaveArea
          );
          $(document).on('click.copy_cut_namespace', divElsName, paste);
          $(document).on(
            'mouseenter.copy_cut_namespace',
            '.menu-pic',
            removeShadowsFromDivEls
          );
        }
        // if copyContainer is empty, hide container and disable all listeners
        else {
          copyContainer.hide();
          // do it ones after final block paste
          initFroala();
        }
      });
    }

    function leaveArea(e) {
      e.stopPropagation();
      console.log(
        'remove hightlights and hide container - $(document).on("mouseleave", allAreaName, function('
      );
      removeShadows($(divElsName));
      copyContainer.hide();
    }

    function whereToPaste(e) {
      e.stopPropagation();
      console.log(
        'determine where to insert - $(document).on("mousemove", divElsName, function(e) { '
      );

      // skip if we are above menu-pic
      if ($('.menu-pic:hover').length) return;

      copyContainer.css({
        top: 5 + e.pageY - $(window).scrollTop() + 'px',
        left: 20 + e.pageX - $(window).scrollLeft() + 'px',
      });
      // if copyContainer is hiding, stop it
      clearTimeout(copyContainerHideTimer);
      copyContainer.show(); // should be shown every time, because it is hidden over menu-pic

      // determine where to insert block and highlight it
      const upperBorder = +$(this).offset().top;
      const lowerBorder = +$(this).offset().top + +$(this).height();
      const distToUpperBorder = e.pageY - upperBorder;
      const distToLowerBorder = lowerBorder - e.pageY;
      const elHeight = $(this).height();

      // remove shadow to appy it again after calculation
      removeShadows($(this).add($(this).prev()).add($(this).next()));

      // 35% from the top or bottom consider as line replacement
      if (distToUpperBorder / elHeight < 0.35) {
        if ($(this).is(':first-child')) {
          insertTo = 'VeryTop';
          $(this).addClass('shadow-blue-top');
        } else {
          insertTo = 'Above';
          $(this).prev().addClass('shadow-blue-bottom');
        }
      } else if (distToLowerBorder / elHeight < 0.35) {
        insertTo = 'Under';
        $(this).addClass('shadow-blue-bottom');
      } else {
        $(this).addClass('shadow-red-all');
        insertTo = 'Middle';
      }
    }

    // determin where to paste copied el
    $(document).on('mousemove.copy_cut_namespace', divElsName, whereToPaste);
    // paste copied el
    $(document).on('click.copy_cut_namespace', divElsName, paste);
    // remove shadow if we went out of whole area for ex to Nav panel
    $(document).on('mouseleave.copy_cut_namespace', allAreaName, leaveArea);
    // hide copyContainer and disable highlight (by stopPropagation) if we are above menuPic
    $(document).on(
      'mouseenter.copy_cut_namespace',
      '.menu-pic',
      removeShadowsFromDivEls
    );

    // close
    underLayer.trigger('click');
  });
});

// ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓ cost-menu ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓

$(document).on('click', '.cost-menu-pic.tr', function (e) {
  e.stopPropagation();
  console.log('$(document).on("click", ".cost-menu-pic", function(e)');

  const menuPicEl = $(this);
  const trEl = menuPicEl.closest('tr');
  const blockEl = menuPicEl.closest('.block');
  const underLayer = $('#under-layer');
  const menuEl = menuPicEl.siblings('.costs-menu');
  const itemEl = trEl.children('.row-item');
  const qtyEl = trEl.children('.row-qty');
  const priceEl = trEl.children('.row-price');
  const pricePinInMenuEl = menuEl.find('.price-row .pin');
  const priceInMenuEl = menuEl.find('.price');
  const qtyInMenuEls = menuEl.find('.cost-row .qty');
  const qtyNotPinnedInMenuEls = qtyInMenuEls.not('.pinned');
  const formulaEls = menuEl.find('.calc-container > div > *:nth-child(-n+5)');

  // show menu and underlayer, which is needed to close menu if we click outside the menu
  menuEl.show();
  underLayer.insertAfter(menuEl);
  underLayer.show();

  // underlayer, no need to off, because anyway you have to do it by click
  underLayer.one('click', function (e) {
    e.stopPropagation();
    console.log('underLayer.one("click", function()');
    underLayer.hide();
    menuEl.hide();
    menuEl.off();
  });

  // ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓ + / - buttons click in .costs-menu ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓

  // hover over .add-cost-btn
  let copiedRow;
  menuEl.on('mouseenter', '.add-btn', function (e) {
    console.log(' menuEl.on("mouseenter", ".add-btn", function(e) ');
    const thisLine = $(this).closest('.cost-row');
    copiedRow = thisLine.clone();
    copiedRow.hide();
    copiedRow.find('.cost, .costs, .perc, .name').text('');
    copiedRow.find('.qty').text('1');
    copiedRow.insertAfter(thisLine);
    copiedRow.slideDown();
    copiedRow.addClass('shadow-green-all');
  });

  // hover over .delete-cost-btn
  menuEl.on('mouseenter', '.delete-btn', function (e) {
    console.log(' menuEl.on("mouseenter", ".delete-btn", function(e)  ');
    $(this).closest('.cost-row').addClass('shadow-red-all');
  });

  // hover away
  menuEl.on('mouseleave', '.add-btn, .delete-btn', function (e) {
    console.log(
      ' menuEl.on("mouseleave", ".add-btn, .delete-btn", function(e)   '
    );
    removeShadows($(this).closest('.cost-row'));
    if (copiedRow) copiedRow.stop().remove();
  });

  // click on .add-cost-btn
  menuEl.on('click', '.add-btn', function (e) {
    console.log(' menuEl.on("click", ".add-btn", function(e)   ');
    removeShadows(copiedRow);
    // after click add new line, the same way we do it on mouseenter
    // this way we can add multiple rows on repetitive clicks
    $(this).trigger('mouseenter');
  });

  // click on .delete-cost-btn
  menuEl.on('click', '.delete-btn', function (e) {
    console.log(' menuEl.on("click", ".delete-btn", function(e)    ');
    const thisLine = $(this).closest('.cost-row');
    const siblingEl = thisLine.siblings().first();
    // if no siblings, then its the last cost row
    if (!thisLine.siblings('.cost-row').length) {
      thisLine
        .addClass('shake')
        .delay(1500)
        .queue(function () {
          $(this).removeClass('shake');
          $(this).dequeue();
          showFooterTemp("can't delete last element");
        });
      return;
    }
    setTimeout(() => {
      thisLine.slideUp(() => {
        thisLine.remove();
        boqPrice($(this));
        blockPrices();
        updateCostMenu(siblingEl);

        // put Price in TR and recalc Item
        priceEl.html(
          priceInMenuEl.toNum().toTxt(2) + txtAfterVal(priceEl.text())
        );
        trItemCalc($(this));
      });
    }, 350);
  });

  // click on pin
  menuEl.on('click', '.pin', function () {
    console.log('menuEl.on("click", ".pin", function() ');
    pinClick($(this));
  });

  // prevent bubbling some event on document level
  // otherwise triggers -- $(document).on("focusout", ".block-table tbody td", function() --
  menuEl.on('focusin focusout', function (e) {
    e.stopPropagation();
  });

  // remove and put % on focusin and focusout
  menuEl
    .on('focusin', '.perc', function (e) {
      console.log('menuEl.on("focusin", ".perc", function()');
      $(this).text($(this).text().replace('%', '').trim());
      // select val on focus
      requestAnimationFrame(() => document.execCommand('selectAll'));
    })
    .on('focusout', '.perc', function (e) {
      console.log('menuEl.on("focusout", ".perc", function()');
      let val = $(this).toNum().toTxt();
      if (val) val = val + ' %';
      $(this).text(val);
    });

  // select val on focus
  menuEl.on('focus', '.cost, .qty, .costs, .perc', function (e) {
    console.log(
      'menuEl.one("focusin", ".cost-row .costs, .margin-row .margin, .price", function(e'
    );
    requestAnimationFrame(() => document.execCommand('selectAll'));
  });

  // seperate thousands for costs on focusout
  menuEl.on(
    'focusout',
    '.cost-row .costs, .margin-row .margin, .price',
    function (e) {
      console.log(
        'menuEl.on("focusout", ".cost-row .costs, .margin-row .margin, .price", function(e'
      );
      $(this).text($(this).toNum().toTxt(2));
    }
  );

  // calculate menu on costs / margin / price change inside menu
  menuEl.on(
    'input',
    '.cost-row .costs, .cost-row .perc, .margin-row .margin, .margin-row .perc, .price',
    function () {
      console.log(
        'menuEl.on("input", ".cost-row .costs, .cost-row .perc, .margin-row .margin, .margin-row .perc, .price", function()'
      );
      if (!$(this).hasClass('pinned')) $(this).prev().trigger('click');
      updateCostMenu($(this));

      // put Price in TR and recalc Item
      priceEl.html(
        priceInMenuEl.toNum().toTxt(2) + txtAfterVal(priceEl.text())
      );
      trItemCalc($(this));
    }
  );

  // calculate menu on cost change inside menu
  menuEl.on('input', '.cost-row .cost', function () {
    console.log(
      'menuEl.on("input", ".cost-row .cost, .cost-row .qty", function()'
    );
    const rowEl = $(this).parent();
    const costEl = rowEl.children('.cost');
    const qtyEl = rowEl.children('.qty');
    const costsEl = rowEl.children('.costs');

    costsEl.text((costEl.toNum() * qtyEl.toNum()).toTxt(2));
    updateCostMenu($(this));

    // put Price in TR and recalc Item
    priceEl.html(priceInMenuEl.toNum().toTxt(2) + txtAfterVal(priceEl.text()));
    trItemCalc($(this));
  });

  // calculate menu on qty change inside menu
  menuEl.on('input', '.cost-row .qty', function () {
    console.log(
      'menuEl.on("input", ".cost-row .cost, .cost-row .qty", function()'
    );
    const rowEl = $(this).parent();
    const costEl = rowEl.children('.cost');
    const qtyEl = rowEl.children('.qty');
    const costsEl = rowEl.children('.costs');

    costsEl.text((costEl.toNum() * qtyEl.toNum()).toTxt(2));
    $(this).add($(this).prev()).removeClass('unpinned').addClass('pinned');
    updateCostMenu($(this));

    // put Price in TR and recalc Item
    priceEl.html(priceInMenuEl.toNum().toTxt(2) + txtAfterVal(priceEl.text()));
    trItemCalc($(this));
  });
});

function pinClick(pinEl) {
  const rowEl = pinEl.parent();
  const menuEl = pinEl.closest('.costs-menu');
  const formulaEls = menuEl.find('.calc-container > div > *:nth-child(-n+5)');
  const trEl = pinEl.closest('tr');
  const priceEl = trEl.children('.row-price');
  const qtyEl = trEl.children('.row-qty');
  const priceInMenuEl = menuEl.find('.price');

  if (rowEl.hasClass('cost-row')) {
    if (pinEl.hasClass('costs-pin')) {
      pinEl
        .nextAll('.perc-pin, .perc')
        .removeClass('pinned')
        .addClass('unpinned');
      pinEl.add(pinEl.next()).removeClass('unpinned').addClass('pinned');
      pinEl
        .prevAll('.qty-pin, .qty')
        .removeClass('unpinned')
        .addClass('pinned');
      formulaEls.show();
      pinEl.prevAll().removeClass('invisible');
    } else if (pinEl.hasClass('perc-pin')) {
      pinEl.siblings('.pinned').removeClass('pinned').addClass('unpinned');
      pinEl.add(pinEl.next()).removeClass('unpinned').addClass('pinned');
      pinEl.siblings('.costs-pin').prevAll().addClass('invisible');
      if (!formulaEls.not('.invisible').length)
        menuEl.find('.calc-container > div > *:nth-child(-n+5)').hide();
    } else if (pinEl.hasClass('qty-pin')) {
      if (pinEl.hasClass('pinned')) {
        pinEl.add(pinEl.next()).removeClass('pinned').addClass('unpinned');
        // take qty from the td row and calc menu
        let qty = isNaN(parseFloat(qtyEl.text())) ? 1 : qtyEl.toNum();
        const costEl = pinEl.siblings('.cost');
        const qtyElinMenu = pinEl.siblings('.qty');
        const costsEl = pinEl.siblings('.costs');
        qtyElinMenu.text(qty);
        costsEl.text((costEl.toNum() * qty).toTxt(2));

        updateCostMenu(pinEl);

        // put Price in TR and recalc Item
        priceEl.html(
          priceInMenuEl.toNum().toTxt(2) + txtAfterVal(priceEl.text())
        );
        trItemCalc(pinEl);
      } else {
        pinEl.add(pinEl.next()).removeClass('unpinned').addClass('pinned');
      }
    }
  } else if (rowEl.hasClass('margin-row') || rowEl.hasClass('price-row')) {
    if (pinEl.hasClass('pinned')) {
      // just unpin
      pinEl.add(pinEl.next()).removeClass('pinned').addClass('unpinned');
    } else {
      // unpin others and pin this
      menuEl
        .find('.margin-row, .price-row')
        .find('.pinned')
        .removeClass('pinned')
        .addClass('unpinned');
      pinEl.add(pinEl.next()).removeClass('unpinned').addClass('pinned');
    }
  }
}

function updateCostMenu(zis) {
  let menuEl;
  if (zis.closest('.costs-menu').length) menuEl = zis.closest('.costs-menu');
  if (zis.find('.costs-menu').length) menuEl = zis.find('.costs-menu');
  if (zis.siblings().find('.costs-menu').length)
    menuEl = zis.siblings().find('.costs-menu');

  const menuPicEl = menuEl.siblings('.cost-menu-pic');

  const costsEls = menuEl.find('.cost-row .costs');
  const costsPinnedEls = costsEls.filter('.pinned');
  const costsNotPinnedEls = costsEls.not('.pinned');

  const percEls = menuEl.find('.cost-row .perc');
  const percPinnedEls = percEls.filter('.pinned');

  const marginEl = menuEl.find('.margin-row .costs');
  let margin = marginEl.toNum();

  const marginPercEl = menuEl.find('.margin-row .perc');
  let marginPerc = marginPercEl.toNum();

  const pricePinEl = menuEl.find('.price-row .pin');
  const priceEl = menuEl.find('.price-row .costs');
  let price = priceEl.toNum();

  function calcMenuWithPinnedPrice() {
    // costs from pinned %
    costsNotPinnedEls.each(function () {
      const percent = $(this).siblings('.perc').toNum();
      $(this).text(((price * percent) / 100).toTxt(2));
    });

    // % from pinned costs
    costsPinnedEls.each(function () {
      const costs = $(this).toNum();
      let perc = ((100 * costs) / price).toTxt(2);
      if (perc) perc = perc + ' %';
      $(this).siblings('.perc').text(perc);
    });

    // cost from costs
    costsEls.each(function () {
      const costs = $(this).toNum();
      const costEl = $(this).siblings('.cost');
      const qtyEl = $(this).siblings('.qty');
      const qty = qtyEl.toNum();
      const cost = (costs / qty).toTxt(2);
      // do not calculate cost if we modify cost or qty, meaning if they are focused
      // in such case other event will caluclate Costs and then calculate all menu
      // otherwise we modify cost, and in the same time calculate and write it

      if (!costEl.is(':focus') && !qtyEl.is(':focus')) costEl.text(cost);
    });

    // total costs
    let costTotal = 0;
    costsEls.each(function () {
      costTotal += $(this).toNum();
    });

    // margin
    if (!marginEl.hasClass('pinned')) {
      // check to avoid recalc and re-assign when margin is pinned
      margin = price - costTotal;
      marginEl.text(margin.toTxt(2));
    }

    // margin %
    if (!marginPercEl.hasClass('pinned')) {
      // check to avoid recalc and re-assign when margin % is pinned
      let perc = ((100 * margin) / price).toTxt(2);
      if (perc) perc = perc + ' %';
      marginPercEl.text(perc);
    }
  }

  // pin price, if nothing is pinned
  if (!priceEl.add(marginEl).add(marginPercEl).hasClass('pinned'))
    pricePinEl.trigger('click');

  // if price is pinned
  if (priceEl.hasClass('pinned')) {
    calcMenuWithPinnedPrice();
  }
  // if margin or margin % are pinned
  else {
    // total pinned costs
    let costPinnedTotal = 0;
    costsPinnedEls.each(function () {
      costPinnedTotal += $(this).toNum();
    });

    // total pinned %
    let percPinnedTotal = 0;
    percPinnedEls.each(function () {
      percPinnedTotal += $(this).toNum();
    });

    if (marginEl.hasClass('pinned')) {
      // if margin is pinned
      // new price
      price = (margin + costPinnedTotal) / (1 - percPinnedTotal / 100);
    } else if (marginPercEl.hasClass('pinned')) {
      // if margin % is pinned
      price = costPinnedTotal / (1 - percPinnedTotal / 100 - marginPerc / 100);
    }

    priceEl.text(price.toTxt(2));
    calcMenuWithPinnedPrice();
  }

  // highlight if % is negative or over 100

  percEls.add(marginPercEl).each(function () {
    const perc = $(this).toNum();
    if (perc < 0 || perc > 100) {
      $(this).add(menuPicEl).addClass('red');
    } else {
      $(this).add(menuPicEl).removeClass('red');
    }
  });

  // put red border to menu if margin is red
  if (percEls.add(marginPercEl).hasClass('red')) {
    menuEl.add(menuPicEl).addClass('shadow-red');
  } else {
    menuEl.add(menuPicEl).removeClass('shadow-red');
  }
}

// ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓ Item / Qty / Price ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓

$(document).on('focusin', '.block-table tbody tr', function () {
  console.log('$(document).on("focusin", ".block-table tbody tr", function()');
  const trEl = $(this);
  const itemEl = trEl.children('.row-item');
  const qtyEl = trEl.children('.row-qty');
  const priceEl = trEl.children('.row-price');
  const menuEl = trEl.find('.costs-menu');
  const pricePinInMenuEl = menuEl.find('.price-row .pin');
  const priceInMenuEl = menuEl.find('.price');
  const qtyInMenuEls = menuEl.find('.cost-row .qty');
  const qtyNotPinnedInMenuEls = qtyInMenuEls.not('.pinned');

  trEl.off();
  trEl.children().off();

  // turn off events
  $(document).one('focusout', '.block-table tbody tr', function () {
    console.log(
      '$(document).on("focusout", ".block-table tbody tr", function()'
    );
    trEl.off();
    trEl.children().off();
  });

  // make seperate on focus + input for qty, because need to recalc costs

  // calc price on item + qty input
  itemEl.add(qtyEl).on('input', function () {
    console.log('itemEl.add(qtyEl).on("input", function()');
    trPriceCalc($(this));
  });

  // calc item on price input
  priceEl.on('input', function () {
    console.log('priceEl.on("input", function()');

    trItemCalc($(this));
    pinPriceInMenu($(this));

    // put price in menu
    priceInMenuEl.text(priceEl.toNum().toTxt(2));
    updateCostMenu($(this));

    boqPrice($(this));
    blockPrices();
  });

  // remove less than a sent from a number and seperate text from number for an item and a price
  itemEl.add(priceEl).on('focusout', function () {
    console.log('itemEl.add(priceEl).on("focusout", function()');
    const el = $(this);
    el.html(el.toNum().toTxt(2) + txtAfterVal(el.text()));

    // if item X qty <> price --> recalc
    let qty = isNaN(parseFloat(qtyEl.text())) ? 1 : qtyEl.toNum();
    if (itemEl.toNum() * qty != priceEl.toNum()) trPriceCalc($(this));
  });

  // seperate text from number for qty
  qtyEl.on('focusout', function () {
    console.log('qtyEl.on("focusout", function()');
    const el = $(this);
    el.html(el.toNum().toTxt() + txtAfterVal(el.text()));

    // if item X qty <> price --> recalc
    let qty = isNaN(parseFloat(qtyEl.text())) ? 1 : qtyEl.toNum();
    if (itemEl.toNum() * qty != priceEl.toNum()) trPriceCalc($(this));
  });
});

function trPriceCalc(zis) {
  const trEl = zis.closest('tr');
  const itemEl = trEl.find('.row-item');
  const qtyEl = trEl.find('.row-qty');
  const priceEl = trEl.find('.row-price');
  const menuEl = trEl.find('.costs-menu');
  const pricePinInMenuEl = menuEl.find('.price-row .pin');
  const priceInMenuEl = menuEl.find('.price');
  const qtyInMenuEls = menuEl.find('.cost-row .qty');
  const qtyNotPinnedInMenuEls = qtyInMenuEls.not('.pinned');

  // if no qty provided or text, assume it is 1
  let qty = isNaN(parseFloat(qtyEl.text())) ? 1 : qtyEl.toNum();
  // calc price and put into cell
  const price = itemEl.toNum() * qty;
  priceEl.html(price.toTxt(2) + txtAfterVal(priceEl.text()));
  boqPrice(zis);
  blockPrices();

  // pin price in menu
  menuEl
    .find('.margin-row')
    .children()
    .removeClass('pinned')
    .addClass('unpinned');
  pricePinInMenuEl
    .add(priceInMenuEl)
    .removeClass('unpinned')
    .addClass('pinned');
  // put price in menu
  priceInMenuEl.text(price.toTxt(2));

  // update not pinned qty and cost
  qtyNotPinnedInMenuEls.each(function () {
    const costEl = $(this).siblings('.cost');
    const costsEl = $(this).siblings('.costs');
    $(this).text(qty);
    costsEl.text((costEl.toNum() * qty).toTxt(2));
  });

  updateCostMenu(zis);
}

function trItemCalc(zis) {
  const trEl = zis.closest('tr');
  const itemEl = trEl.find('.row-item');
  const qtyEl = trEl.find('.row-qty');
  const priceEl = trEl.find('.row-price');
  const menuEl = trEl.find('.costs-menu');

  // if no qty provided or text, assume it is 1
  let qty = isNaN(parseFloat(qtyEl.text())) ? 1 : qtyEl.toNum();
  // calc item and put into cell
  const item = priceEl.toNum() / qty;

  itemEl.html(item.toTxt(2) + txtAfterVal(itemEl.text()));

  if (!priceEl.is(zis)) {
    // if item X qty <> price --> recalc
    if (itemEl.toNum() * qty != priceEl.toNum()) {
      const price = itemEl.toNum() * qty;
      priceEl.html(price.toTxt(2) + txtAfterVal(priceEl.text()));
    }

    boqPrice(zis);
    blockPrices();
  }
}

function pinPriceInMenu(zis) {
  const trEl = zis.closest('tr');
  const menuEl = trEl.find('.costs-menu');
  const pricePinInMenuEl = menuEl.find('.price-row .pin');
  const priceInMenuEl = menuEl.find('.price');

  // pin price in menu
  menuEl
    .find('.margin-row')
    .children()
    .removeClass('pinned')
    .addClass('unpinned');
  pricePinInMenuEl
    .add(priceInMenuEl)
    .removeClass('unpinned')
    .addClass('pinned');
}

function boqPrice(zis) {
  const boqEl = zis.closest('.boq-block');
  const subtotalPriceEl = boqEl.find('.subtotal-containter .row-price');
  const tdPricesEls = boqEl.find('.block-table .row-price');

  let totalPrice = 0;
  tdPricesEls.each(function () {
    totalPrice += $(this).toNum();
  });

  if (totalPrice == 0) {
    subtotalPriceEl.text(0);
  } else {
    subtotalPriceEl.text(totalPrice.toTxt(2));
  }
}

function blockPrices() {
  const priceBlockEls = $('#all-without-nav').find('.price-block');
  priceBlockEls.each(function () {
    const prevBlockEls = $(this).prevUntil('.price-block').filter('.boq-block');
    const subtotalPriceEls = prevBlockEls.find(
      '.subtotal-containter .row-price'
    );
    const priceWithoutTaxEl = $(this).find('.price-without-tax-val');
    const priceWithTaxEl = $(this).find('.price-with-tax-val');
    const taxValEl = $(this).find('.tax-val');

    let totalPrice = 0;
    subtotalPriceEls.each(function () {
      totalPrice += $(this).toNum();
    });

    if (totalPrice == 0) {
      priceWithoutTaxEl.text(0);
    } else {
      priceWithoutTaxEl.text(totalPrice.toTxt(2));
    }

    priceWithTaxEl.text(((1 + taxValEl.toNum() / 100) * totalPrice).toTxt(2));
  });
}

// ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓ Subtotal ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓

$(document).on('click', '.heading .cost-menu-pic.subtotal', function (e) {
  e.stopPropagation();
  console.log('$(document).on("click", ".heading .cost-menu-pic", function(e)');

  const menuPicEl = $(this);
  const menuEl = menuPicEl.siblings('.costs-menu');
  const blockEl = menuPicEl.closest('.block');
  const underLayer = $('#under-layer');

  // show menu and underlayer, which is needed to close menu if we click outside the menu
  menuEl.show();
  underLayer.insertAfter(menuEl);
  underLayer.show();

  // underlayer, no need to off, because anyway you have to do it by click
  underLayer.one('click', function (e) {
    e.stopPropagation();
    console.log('underLayer.one("click", function()');
    underLayer.hide();
    menuEl.hide();
    menuEl.off();
  });

  calcBlockCostMenu(blockEl, menuEl);
  storeTrPricesInArr(blockEl);
});

function calcBlockCostMenu(basedOnBlocksEls, menuEl) {
  const menuCalcContainerEl = menuEl.find('.calc-container');
  menuCalcContainerEl.html('');

  // array with unique line names
  const arr = [];

  // take unique .cost rows and prepend to menu
  const trEls = basedOnBlocksEls.find('table tbody tr');
  const trCalcContainerEls = trEls.find('.calc-container');
  const trRowEls = trCalcContainerEls.children();
  const trCostRowEls = trRowEls.filter('.cost-row');
  const trCostRowNameEls = trCostRowEls.find('.name');

  // put TR menu row els with unique names into menu
  trCostRowNameEls.each(function () {
    if (!arr.includes($(this).text())) {
      arr.push($(this).text());
      $(this).parent().clone().appendTo(menuCalcContainerEl);
    }
  });

  // take first price and margin rows rom TR and put to menu
  const menuMarginEl = trEls.find('.margin').first().parent().clone();
  const menuPriceEl = trEls.find('.price').first().parent().clone();
  // prepend .margin and .price to menu
  menuMarginEl.appendTo(menuCalcContainerEl);
  menuPriceEl.appendTo(menuCalcContainerEl);

  const menuRowEls = menuCalcContainerEl.children();

  // sum all TR vals with same names and put into menu
  menuRowEls.each(function () {
    const menuRowEl = $(this);

    let qtySum = 0,
      costsSum = 0;
    let trQtyPinFixedEverywhere = true,
      trCostPinFixedEverywhere = true,
      trPercPinFixedEverywhere = true;
    const menuRowName = menuRowEl.find('.name').text();
    trRowEls.each(function () {
      const trRowEl = $(this);
      const trRowName = trRowEl.find('.name').text();
      if (menuRowName == trRowName) {
        const trCostsVal = trRowEl.find('.costs').toNum();
        const trQtyVal = trRowEl.find('.qty').toNum();

        // calc total qty and costs in TR menus
        if (trCostsVal) {
          qtySum += trQtyVal;
          costsSum += trCostsVal;
        }

        // show formula part if formula part is shown in TR menus
        if (!trRowEl.find('.equal').hasClass('invisible')) {
          menuRowEls.show();
          menuRowEl
            .find('.cost, .x, .qty-pin, .qty, .equal')
            .removeClass('invisible')
            .show();
        }

        // check if same element is pinned in every TR row
        if (
          trQtyPinFixedEverywhere &&
          !trRowEl.find('.qty-pin').hasClass('pinned')
        )
          trQtyPinFixedEverywhere = false;
        if (
          trCostPinFixedEverywhere &&
          !trRowEl.find('.costs-pin').hasClass('pinned')
        )
          trCostPinFixedEverywhere = false;
        if (
          trPercPinFixedEverywhere &&
          !trRowEl.find('.perc-pin').hasClass('pinned')
        )
          trPercPinFixedEverywhere = false;
      }
    });

    menuRowEl.find('.qty').text(qtySum.toTxt());
    menuRowEl.find('.costs').text(costsSum.toTxt());
    menuRowEl.find('.cost').text((costsSum / qtySum).toTxt(2));

    // pin el in subtotal cost menu only if all same els in tr cost menues are pinned
    const menuQtyPinEl = menuRowEl.find('.qty-pin');
    const menuCostsPinEl = menuRowEl.find('.costs-pin');
    const menuPercPinEl = menuRowEl.find('.perc-pin');

    if (trQtyPinFixedEverywhere) {
      menuQtyPinEl
        .add(menuQtyPinEl.next())
        .removeClass('unpinned')
        .addClass('pinned');
    } else {
      menuQtyPinEl
        .add(menuQtyPinEl.next())
        .removeClass('pinned')
        .addClass('unpinned');
    }

    if (trCostPinFixedEverywhere) {
      menuCostsPinEl
        .add(menuCostsPinEl.next())
        .removeClass('unpinned')
        .addClass('pinned');
    } else {
      menuCostsPinEl
        .add(menuCostsPinEl.next())
        .removeClass('pinned')
        .addClass('unpinned');
    }

    if (trPercPinFixedEverywhere) {
      menuPercPinEl
        .add(menuPercPinEl.next())
        .removeClass('unpinned')
        .addClass('pinned');
    } else {
      menuPercPinEl
        .add(menuPercPinEl.next())
        .removeClass('pinned')
        .addClass('unpinned');
    }
  });

  // % from costs
  const price = menuPriceEl.find('.costs').toNum();
  menuRowEls.find('.perc').each(function () {
    let perc = ((100 * $(this).siblings('.costs').toNum()) / price).toTxt(2);
    if (perc) perc = perc + ' %';
    $(this).text(perc);
  });

  // click on pin to pin it in every TR
  menuRowEls.on('click', '.pin', function () {
    console.log('pinNotPinnedInMenuEls.on("click", function(e)"');
    if (
      confirm(
        'All similar items in product lines will be pinned. \n\n Are you sure?'
      )
    ) {
      menuEl.off();
      menuRowEls.off();

      const nameVal = $(this).siblings('.name').text();
      const className = $(this).attr('class').split(/\s+/)[0]; // take first class from all classes
      trRowEls.has('.' + className).each(function () {
        if ($(this).find('.name').text() == nameVal) {
          console.log('click on this pin');
          pinClick($(this).find('.' + className));
        }
      });
      calcBlockCostMenu(basedOnBlocksEls, menuEl);
    }
  });
}

function storeTrPricesInArr(blockEls) {
  // store row prices to remember them to change tr prices proportionally if we modify subtotal price
  prevSubtotalPrice = blockEls.find('.subtotal-menu .price').toNum();
  prevTrPriceArr = [];
  prevSubtotalPriceNotFixed = 0;

  const trContainerEl = blockEls.find('table .calc-container');

  // get only cost-menues without fixed price or margin, because we can not change them automatically if they are fixed
  const nonFixedTrPricesEls = trContainerEl
    .find('.margin-row, .price-row')
    .not(':has(.margin.pinned, .perc.pinned, .price.pinned)')
    .find('.price');

  nonFixedTrPricesEls.each(function () {
    let rowPrice = $(this).toNum();
    prevTdPriceArr.push(rowPrice);
    prevSubtotalPriceNotFixed = prevSubtotalPriceNotFixed + rowPrice;
  });
}

function checkIfAllPricesAreFixed(zis) {
  const costMenuesWithNonFixedPrices = zis
    .closest('.boq-block')
    .find('.block-table .row-price-menu')
    .not(':has(.margin.pinned, .margin-percents.pinned, .price.pinned)');
  if (costMenuesWithNonFixedPrices.length == 0) {
    alert(
      'all induvidual prices are fixed! remove red underline by clicking on margin or price inside menu'
    );
    return true;
  } else {
    const priceEls = costMenuesWithNonFixedPrices
      .closest('.row')
      .find('.row-price');
    let numberOfEls = priceEls.length;
    priceEls.each(function () {
      if (isNaN($(this).toNum())) {
        numberOfEls = numberOfEls - 1;
      }
    });
    if (numberOfEls == 0) {
      alert(
        'all induvidual prices are fixed or pirces are not set! remove red underline by clicking on margin or price inside menu'
      );
      return true;
    } else {
      return false;
    }
  }
}

function recalcRowPrices(zis) {
  const costMenuesWithNonFixedPrices = zis
    .closest('.boq-block')
    .find('.block-table .row-price-menu')
    .not(':has(.margin.pinned, .margin-percents.pinned, .price.pinned)');
  const newSubtotalPrice = parseFloat(
    zis.closest('.boq-block').find('.subtotal-containter .row-price').text()
  );
  const newSubtotalPriceNotFixed =
    newSubtotalPrice - prevSubtotalPrice + prevSubtotalPriceNotFixed;
  const pricesTrEls = costMenuesWithNonFixedPrices
    .closest('.row')
    .find('.row-price');
  for (let i = 0; i < pricesTrEls.length; i++) {
    let currentPriceTd = pricesTrEls.eq(i);
    let newPriceTdFloat =
      (newSubtotalPriceNotFixed * prevTdPriceArr[i]) /
      prevSubtotalPriceNotFixed;
    if (isNaN(newPriceTdFloat)) {
      currentPriceTd.html(txtAfterValue(currentPriceTd));
    } else {
      currentPriceTd.html(
        newPriceTdFloat + ' ' + txtAfterValue(currentPriceTd)
      );
    }
    itemRecalculate(currentPriceTd);
    priceRounding(currentPriceTd);
    removePin(currentPriceTd);
    updateCostMenuWithPinnedPrice(currentPriceTd);
  }
}

/*
// subtotal price
$(document).on("mouseenter", ".subtotal-containter .row-price", function(e) {
    calcBlockCostMenu($(this));
    //showCostMenu($(this));
}).on("focus", ".subtotal-containter .row-price", function(e) {
    storeBlockPricesInArr($(this));
}).on("keydown", ".subtotal-containter .row-price", function(e) {
    if(checkIfAllPricesAreFixed($(this))) {
        e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
        return;
    }
}).on("keyup", ".subtotal-containter .row-price", function(e) {
    storeBlockPricesInArr($(this));
}).on("input", ".subtotal-containter .row-price", function(e) {
    recalcRowPrices($(this));
    calcBlockCostMenu($(this));
    blockPrices();
}).on("mouseleave", ".subtotal-containter .row-price", function(e) {
    // hideCostMenu($(this));
}).on("focusout", ".subtotal-containter .row-price", function(e) {
    // hideCostMenu($(this));
    //boqPrice($(this));
    //blockPrices();
});

// ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓ cost menu in Subtotal ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
// calculate price on pinned margin change
$(document).on("focus", ".bock-price-menu .costs-menu .margin", function(e) {
    storeBlockPricesInArr($(this));
}).on("keydown", ".bock-price-menu .costs-menu .margin", function(e) {
    if(checkIfAllPricesAreFixed($(this))) {
        e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
        return;
    }
}).on("input", ".bock-price-menu .costs-menu .margin", function(e) {
    calcPriceWithPinnedMargin($(this));
    updateCostMenuWithPinnedMargin($(this));
    recalcRowPrices($(this));
    //boqPrice($(this));
    //blockPrices();
});

// calculate price on pinned % change
$(document).on("focus", ".bock-price-menu .costs-menu .margin-percents", function(e) {
    storeBlockPricesInArr($(this));
}).on("keydown", ".bock-price-menu .costs-menu .margin-percents", function(e) {
    if(checkIfAllPricesAreFixed($(this))) {
        e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
        return;
    }
}).on("input", ".bock-price-menu .costs-menu .margin-percents", function(e) {
    calcPriceWithPinnedPercents($(this));
    updateCostMenuWithPinnedPercent($(this));
    recalcRowPrices($(this));
    //boqPrice($(this));
    //blockPrices();
});

*/
