# moodle-atto-getquestion

a Moodle plugin for the Atto editor.

This plugin uses jQuery to retrieve a list of questions encoded in JSON. It then
offers the list of questions with a select box to change categories. The
select can then be written to the active Atto editor.

This plugin hard codes the [Generico plugin](https://github.com/justinhunt/moodle-filter_generico)
text as the insert string. I decided to develop this in a separate plugin, but it
could be ported to Generico without too much alteration.

Developed for University of Oxford Medical Sciences Office by Will Hanrott, Nov
2016. Adapted from Justin Hunt's [NewTemplate Atto Plugin](https://github.com/justinhunt/moodle-atto_newtemplate),
which provides a starting point for Atto plugin development.

This plugin is still in development so I've excluded the yui/build directory. You
will have to run <code>sudo -u www-data grunt shifter</code> on the target system
to build the JavaScript plugin fully.
