/*
    Helper:Form
    -----------

    @file       Form.js
    @package    Kords/View/Helper
    @author     Gideon Farrell <me@gideonfarrell.co.uk>
 */

define(
    ['mootools', 'String.extend', 'backbone', 'View/Helper/Html'],
    function(_mootools, _string, Backbone, HtmlHelper) {
        var FormHelper = new Class({
            Implements: [Options],

            specialAttributes: ['div', 'before', 'after', 'label', 'empty', 'options', 'selected'],

            options: {
                model: null,
                inputDefaults: {
                    'div':        'control-group',
                    'before':     '<div class="controls">',
                    'after':      '</div>',
                    'label':      '',
                    'options':    {},
                    'empty':      'Please select'
                }
            },

            start: function(name, attributes) {
                this._previous_options = this._previous_options || this.options;

                this.setOptions(attributes);
                this.name = name;
                this._elements = {};

                var el = HtmlHelper.element('form', '', this.options.form || {});
                    el.setAttribute('id', this.name+'Form');

                return HtmlHelper.tagFromElement(el).replace('</form>', '');
            },
            end: function(buttons) {
                if(buttons !== false) {
                    // TODO: implement buttons for submit/cancel etc.
                }

                this.options = this._previous_options;
                this.name = null;
                this._elements = {};

                return '</form>';
            },

            // Form element creation methods
            // -----------------------------

            input: function(name, attributes) {
                return this.__makeFormElement('input', name, attributes);
            },

            hidden: function(name, attributes) {
                return this.input(name, _.extend(attributes, {type: 'hidden'}));
            },

            select: function(name, attributes) {
                return this.__makeFormElement('select', name, attributes);
            },

            textarea: function(name, attributes) {
                return this.__makeFormElement('textarea', name, attributes);
            },

            button: function(name, attributes) {
                return HtmlHelper.tag('button', name, Object.merge(attributes, {'id':this.name.capitalize() + name.camelise().capitalize()}));
            },


            // Utility Functions
            // -----------------
            
            __register: function(name, element) {
                this._elements[name] = element;
            },

            __makeTag: function(tag, attributes) {
                if(typeOf(attributes) != 'object') attributes = {};
                return (new Element(tag, attributes));
            },

            __makeHtml: function(tag, attributes) {
                return this.__makeTag(tag, attributes).outerHtml;
            },

            __makeFormElement: function(tag, name, options) {
                // Merge the inputDefaults with the passed options
                var _opt = options; options = Object.clone(this.options.inputDefaults);
                Object.append(options, _opt);

                // Split the names by full stops, this denotes separate fields
                // Create a prettified name for the field id
                // And create a name attribute for the post/get data
                // Extract all options that are not in the inputDefaults and use them as tag attributes

                var names       = name.split('.'),
                    pretty      = names.join('_').camelise().capitalize(),
                    pretty_full = this.name.capitalize() + pretty,
                    data_name   = 'data['+this.name.capitalize()+']['+names.join('][')+']',
                    attributes  = Object.filter(options, function(val, key) { return !this.specialAttributes.contains(key); }, this),
                    parent, enclosure, element, label;

                // Create the element itself
                element = new Element(tag, attributes);
                element.set('id', pretty_full);

                // Register the element in the form store
                this.__register(pretty_full, element);

                // If the tag is select, checkbox, radio deal with options
                switch(tag) {
                    case 'select':
                        // Create the empty option if required
                        if(options.empty !== false) {
                            var empty = new Element('option', {
                                value: '',
                                html: options.empty
                            });
                            empty.inject(element);
                        }

                        // Arrays and Objects have different iterators
                        // But both will use the same format of {value: name} (or [name, name, name])
                        // So we can have the same iterative function, different iterators
                        var optionFunction = function(text, data) {
                            var opt = new Element('option', {
                                value: data,
                                html: text,
                                selected: (options.selected == data.asType(typeOf(options.selected)))
                            });

                            opt.inject(element);
                        };
                        
                        if(typeOf(options.options) == 'array') {
                           options.options.each(optionFunction);
                        } else if(typeOf(options.options) == 'object') {
                            Object.each(options.options, optionFunction);
                        }
                        
                        break;
                    case 'checkbox':
                        console.warn('Not implemented');
                        break;
                    case 'radio':
                        console.warn('Not implemented');
                        break;
                }

                // Now check (if there is a model set) what the value is for this field and set it on the element
                // BUT only do this if the value hasn't been explicitly set
                if(attributes.value === undefined) {
                    if(Backbone.RelationalModel && instanceOf(this.options.model, Backbone.RelationalModel)) {
                        var value  = null,
                            _names = names.clone(),
                            _tmp   = this.options.model;

                        while(_names.length > 1) {
                            // For relational models we have to cycle through the layers
                            _tmp = _tmp.get(_names.shift());
                        }

                        value = _tmp.get(_names.shift());
                    } else if(Backbone.Model && instanceOf(this.options.model, Backbone.Model)) {
                        // For normal models it's a bit easier, we just get the attribute
                        element.set('value', this.options.model.get(name));
                    }
                } else {
                    // For some unknown reason, element.set(value, ....) does not explicitly set the value in HTML terms.
                    // Therefore when we get the outerHTML, the value property isn't present.
                    // To get around this we use the native setAttribute method, which seems to do it properly.
                    element.setAttribute('value', attributes.value);
                }

                // Create the enclosure which is just the raw html
                enclosure = element.outerHTML;

                // Add any before/afters
                if(options.before !== false) {
                    enclosure = options.before + enclosure;
                }
                if(options.after !== false) {
                    enclosure = enclosure + options.after;
                }

                // Create a label if required
                if(options.label !== false) {
                    var label_content = typeOf(options.label) == 'string' && options.label.length > 0 ? options.label : pretty.humanise();
                    label = new Element('label', {'for': pretty_full, 'html': label_content, 'class':'control-label'});
                    enclosure = label.outerHTML + enclosure;
                }

                // Process the parent
                if(options.div !== false) {
                    parent = new Element('div', {'class':options.div, 'html':enclosure});
                    enclosure = parent.outerHTML;
                }

                return enclosure;
            }
        });

        return new FormHelper();
    }
);