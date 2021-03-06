define( [
    'jquery',
    'underscore',
    'backbone',
    'templates',
    'AssetView'
], function ( $, _, Backbone, JST, AssetView ) {

    'use strict';

    var AssetsView = Backbone.View.extend( {

        template    : JST[ 'app/scripts/templates/assets.ejs' ],
        errorFields : [ ],
        events      : {
            'submit  #add-form'           : 'newAsset',
            'hidden.bs.modal #edit-modal' : 'resetForm',
            'hidden.bs.modal #add-modal'  : 'resetForm'
        },

        render : function ( ) {
            var self = this;
            self.$el.html( self.template( ) );
            return self;
        },

        resetForm : function ( e ) {
            var form = e.currentTarget.querySelector( 'form' );
            form.reset( );
            $( form ).find( '.has-error' ).removeClass( 'has-error' );
        },

        initialize : function ( ) {
            var self = this;
            self.listenTo( self.collection, 'add', self.onAdd );
            self.collection.url += "?access_token=" + window.App.view.model.get('access_token');
            self.collection.fetch( );

        },

        newAsset : function ( e ) {

            e.preventDefault( );

            var self     = this;
            var form     = e.currentTarget;
            var newAsset = {};


            newAsset.asset_name        = self.fieldValidation( form.asset_name, /^[a-zA-Z0-9\.\-\,\''\s]{3,30}$/ );
            newAsset.asset_type        = self.fieldValidation( form.asset_type, /^[a-zA-Z0-9\s]{3,30}$/ );
            newAsset.date_purchased    = self.fieldValidation( form.date_purchased, /^\d{2}\/\d{2}\/\d{4}$/ );
            newAsset.status            = self.fieldValidation( form.status, /^(working|defective)$/ );
            newAsset.serial_number     = self.fieldValidation( form.serial_number, /^[a-zA-Z0-9-\s]{5,30}$/ );
            newAsset.supplier          = self.fieldValidation( form.supplier, /^[a-zA-Z0-9\-\.\,\&\s]{5,160}$/ );
            newAsset.reason            = self.fieldValidation( form.reason, /^.{5,160}$/ );
            newAsset.asset_description = self.fieldValidation( form.asset_description, /^.{5,160}$/ );

            if ( self.errorFields.length === 0 ) {
                self.ajaxRequest( form, newAsset );
            } else {
                self.errorFields = [ ];
            }

        },

        ajaxRequest : function ( form, data ) {

            var self = this;

            $( 'input, button, option, textarea' ).prop( 'disabled', true );
            $( '.btns' ).addClass( 'loading' );

            $.post( self.collection.url, data ).done( function ( result ) {

				$( 'input, button, option, textarea' ).prop( 'disabled', false );
				$( '.btns' ).removeClass( 'loading' );

                if ( result._id ) {

                    self.collection.add( result );
                    form.reset( );

                    return $( '#add-modal' ).modal( 'hide' );

                }
                if ( result.errors ) {
                    Object.keys( result.errors ).forEach( function ( key ) {
                        $( form[ key ] ).addClass( 'has-error' );
                    } );
                }
            } );
        },

        onAdd : function ( model ) {

            var self  = this;

			model.url = function () {
				return this.urlRoot() + '/' + model.id + '?access_token=' + window.App.view.model.get('access_token');
            };

            var asset = new AssetView( {
                model: model
            } );


            $( 'tbody.assets-list' ).prepend( asset.render( ).el );

        },

        fieldValidation : function ( field, regexp ) {

            $( field ).removeClass( 'error' );

            if ( field.value.match( regexp ) !== null ) {

                $( field ).parent( ).removeClass( 'has-error' );
                return field.value;

            }

            this.errorFields.pop( field.id );
            this.errorFields.push( field.id );

            $( field ).parent( ).addClass( 'has-error' );

        }

    } );

    return AssetsView;
} );