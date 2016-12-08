YUI.add('moodle-atto_getquestion-button', function (Y, NAME) {

// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/*
 * @package    atto_getquestion
 * @copyright  COPYRIGHTINFO
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/**
 * @module moodle-atto_getquestion-button
 */

/**
 * Atto text editor getquestion plugin.
 *
 * @namespace M.atto_getquestion
 * @class button
 * @extends M.editor_atto.EditorPlugin
 */

var COMPONENTNAME = 'atto_getquestion';
var FLAVORCONTROL = 'getquestion_flavor';
var LOGNAME = 'atto_getquestion';

var CSS = {
        INPUTSUBMIT: 'atto_media_urlentrysubmit',
        INPUTCANCEL: 'atto_media_urlentrycancel',
        FLAVORCONTROL: 'flavorcontrol'
    },
    SELECTORS = {
        FLAVORCONTROL: '.flavorcontrol'
    };

var TEMPLATE = '' +
    '<form class="atto_form">' +
    '<div id="{{elementid}}_{{innerform}}" class="mdl-align">' +
    '<label for="{{elementid}}_{{FLAVORCONTROL}}">{{get_string "enterflavor" component}}</label>' +
    '<input style="display:block; " class="{{CSS.FLAVORCONTROL}}" id="{{elementid}}_{{FLAVORCONTROL}}"' +
    ' name="{{elementid}}_{{FLAVORCONTROL}}" value="{{defaultflavor}}" />' +
    '<button class="{{CSS.INPUTSUBMIT}}">{{get_string "insert" component}}</button>' +
//    '<select class="select searchoptions" id="id_selectacategory" name="category"></select>' +
    '<select id="questionSelect"></select>' +
    '<table id="questionTable" class="table table-bordered"></table>' +
    '</div>' +
    'icon: {{clickedicon}}'  +
    '</form>';

Y.namespace('M.atto_getquestion').Button = Y.Base.create('button', Y.M.editor_atto.EditorPlugin, [], {


     /**
     * Initialize the button
     *
     * @method Initializer
     */
    initializer: function () {
        // If we don't have the capability to view then give up.
        if (this.get('disabled')) {
            return;
        }

        var twoicons = ['iconone', 'icontwo'];

        Y.Array.each(twoicons, function (theicon) {
            // Add the getquestion icon/buttons
            this.addButton({
                icon: 'ed/' + theicon,
                iconComponent: 'atto_getquestion',
                buttonName: theicon,
                callback: this._displayDialogue,
                callbackArgs: theicon
            });
        }, this);

    },

    /**
     * Get the id of the flavor control where we store the ice cream flavor
     *
     * @method _getFlavorControlName
     * @return {String} the name/id of the flavor form field
     * @private
     */
    _getFlavorControlName: function () {
        return (this.get('host').get('elementid') + '_' + FLAVORCONTROL);
    },

     /**
     * Display the getquestion Dialogue
     *
     * @method _displayDialogue
     * @private
     */
    _displayDialogue: function (e, clickedicon) {
        e.preventDefault();
        var width = 400;


        var dialogue = this.getDialogue({
            headerContent: M.util.get_string('dialogtitle', COMPONENTNAME),
            width: width + 'px',
            focusAfterHide: clickedicon
        });
    //dialog doesn't detect changes in width without this
    //if you reuse the dialog, this seems necessary
        if (dialogue.width !== width + 'px') {
            dialogue.set('width', width + 'px');
        }

        //append buttons to iframe
        var buttonform = this._getFormContent (clickedicon);

        var bodycontent =  Y.Node.create('<div>bar</div>');
        bodycontent.append(buttonform);

        //set to bodycontent
        dialogue.set('bodyContent', bodycontent);
        dialogue.show();
        this.markUpdated();
    },


     /**
     * Return the dialogue content for the tool, attaching any required
     * events.
     *
     * @method _getDialogueContent
     * @return {Node} The content to place in the dialogue.
     * @private
     */
    _getFormContent: function (clickedicon) {
      if (clickedicon === "iconone") {
        var template = Y.Handlebars.compile(TEMPLATE),
            content = Y.Node.create(template({
                elementid: this.get('host').get('elementid'),
                CSS: CSS,
                FLAVORCONTROL: FLAVORCONTROL,
                component: COMPONENTNAME,
                defaultflavor: this.get('defaultflavor'),
                clickedicon: clickedicon
            }));

            var bookid = window.location.href.split(/\=|\&|\?/),
                tld = bookid[0].split(/\//)[2],
                url = "/mod/quiz/questionbank.ajax.php",
//                category = "139%2C352",
                cmid = bookid[2],
                restofajax = "&recurse=0&showhidden=0", //&recurse=1
                theurl = "http://" + tld + url + "?cmid=" + cmid + restofajax; //"&category=" + category +
            console.log("start: " + theurl);
            var firstAjax = $.ajax({
                      url: theurl,
                      context: document.body
                  })
                      .done(function () {
                          var rhtml = firstAjax.responseJSON.contents; // #questionSelect is in page. inserts options into select box (question categories)
                          $('#questionSelect').append(
                            $('#id_selectacategory', rhtml).children()
                          );
                          $('#categoryquestions', rhtml).find('tbody label').each( // #categoryquestions is in ajax. inserts list of questions from ajax into table
                              function () {
                                $('#questionTable').append(
                                  "<tr><td>" + "<label><input type='radio' name='questions' value='" +
                                  $(this).attr('for').replace('checkq', '') + "'/>" + "</td><td>" +
                                  $(this).children('span.questionname').text() + "</label>" + "</td></tr>"
                                );
                              }
                          );
                          $('#questionSelect').change(function(){
                            var str = "";
                            $( "select optgroup option:selected" ).each(function() {
                              str = "http://" + tld + url + "?cmid=" + cmid + "&category=" + $(this).attr('value') + restofajax;
                              var changeAjax = $.ajax({url: str}).done(function () {
                                  var rhtml = changeAjax.responseJSON.contents;
                                  $('#questionTable').children().remove();
                                  $('#categoryquestions', rhtml).find('tbody label').each(function () {
                                    //var questiontabledomobject = $('#questionTable');

                                        $('#questionTable').append(
                                          "<tr><td>" + "<label><input type='radio' name='questions' value='" +
                                          $(this).attr('for').replace('checkq', '') + "'/>" + "</td><td>" +
                                          $(this).children('span.questionname').text() + "</label>" + "</td></tr>"
                                        );
                                      });
                                  $('#questionTable tbody tr').on("click", function () {
                                    var questionid = '{GENERICO:type="insert_question",questionid="' +
                                    $(this).find('input').attr('value') +
                                    '"}';
                                    $('#id_content_editor_getquestion_flavor').attr('value', questionid);
                                  });
                              })
                              .fail(function () {
                                  console.log("error second ajax call");
                              })
                              .always(function () {
                                  console.log("complete second ajax call");
                              });
                            $('#id_content_editor_getquestion_flavor').attr('value', str);
                            $('#id_content_editor_').find('label').on("click", function () {
                                var questionid = '{GENERICO:type="insert_question",questionid="' +
                                $(this).children('input').attr('value') +
                                '"}';
                            $('#id_content_editor_getquestion_flavor').attr('value', questionid);
                            var newurl = "http://" + tld + url + "?cmid=" + cmid + "&category=" + questionid + restofajax;
                            console.log("change2: " + newurl);
                          });
                          });
                        });
                      })
                      .fail(function () {
                          console.log("error");
                      })
                      .always(function () {
                          console.log("complete");
                      });
        this._form = content;
        this._form.one('.' + CSS.INPUTSUBMIT).on('click', this._doInsert, this);
        return content;
      } else if (clickedicon === "icontwo"){
        var template2 = Y.Handlebars.compile(TEMPLATE),
            content2 = Y.Node.create(template2({
                elementid: this.get('host').get('elementid'),
                CSS: CSS,
                FLAVORCONTROL: FLAVORCONTROL,
                component: COMPONENTNAME,
                defaultflavor: this.get('defaultflavor'),
                clickedicon: clickedicon
            }));

        this._form = content2;
        this._form.one('.' + CSS.INPUTSUBMIT).on('click', this._doInsert, this);
        var theContext = $('#id_content_editor_', content2._node);
        theContext.ready(function () {
          theContext.find('select').append(
            '<optgroup required="true" label="optgroup_label">' +
            '<option value="a" label="a_label">a_text</option>' +
            '<option value="b" label="b_label" selected="yes">a_text</option>' +
            '</optgroup>');
            initVal = theContext.find('option[selected = "yes"]').attr('value');
            console.log(theContext);
            theContext.children('input').attr('value', initVal);
            theContext.find('select').on("click", function () {
              console.log(this);
              var questionid = '{GENERICO:type="insert_question",questionid="' +
              $(this).find('option').attr('value') +
              '"}';
              alert('qid: ' + questionid);
              $('#id_content_editor_getquestion_flavor').attr('value', questionid);});
            });
            return content2;
      } //else {}
    },

    /**
     * Inserts the users input onto the page
     * @method _getDialogueContent
     * @private
     */
    _doInsert : function (e) {
        e.preventDefault();
        this.getDialogue({
            focusAfterHide: null
        }).hide();

        var flavorcontrol = this._form.one(SELECTORS.FLAVORCONTROL);

        // If no file is there to insert, don't do it.
        if (!flavorcontrol.get('value')) {
            Y.log('No flavor control or value could be found.', 'warn', LOGNAME);
            return;
        }

        this.editor.focus();
        this.get('host').insertContentAtFocusPoint(flavorcontrol.get('value'));
        this.markUpdated();

    }
}, { ATTRS: {
    disabled: {
        value: false
    },

    usercontextid: {
        value: null
    },

    defaultflavor: {
        value: ''
    }
}
    });


}, '@VERSION@', {"requires": ["moodle-editor_atto-plugin"]});
