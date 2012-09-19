/*
    Helper:Html
    -----------

    Helps with HTML generation in templates. Inspired by CakePHP's HTML helper.

    @file       Html.js
    @package    JavascriptHtmlHelpers
    @author     Gideon Farrell <me@gideonfarrell.co.uk>
 */

define(
    ['mootools'],
    function() {
        var HtmlHelper = {
            tag: function(tagName, content, attributes) {
                return this.tagFromElement(this.element(tagName, content, attributes));
            },

            element: function(tagName, content, attributes) {
                var el  = new Element(tagName, attributes || {});
                el.innerHTML = content;

                return el;
            },

            tagFromElement: function(element) {
                return element.outerHTML;
            },

            link: function(url, title, attributes) {
                return this.tag('a', title || url, Object.merge(attributes || {}, {href: url}));
            }
        };

        return HtmlHelper;
    }
);