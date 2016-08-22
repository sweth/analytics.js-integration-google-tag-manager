'use strict';

/**
 * Module dependencies.
 */

var integration = require('@segment/analytics.js-integration');
var push = require('global-queue')('dataLayer', { wrap: false });

/**
 * Expose `GTM`.
 */

var GTM = module.exports = integration('Google Tag Manager')
  .assumesPageview()
  .global('dataLayer')
  .global('google_tag_manager')
  .option('initialDataLayer', {})
  .option('containerId', '')
  .option('trackNamedPages', true)
  .option('trackCategorizedPages', true)
  .tag('<script src="//www.googletagmanager.com/gtm.js?id={{ containerId }}&l=dataLayer">');

/**
 * Initialize.
 *
 * https://developers.google.com/tag-manager
 *
 * @api public
 */

GTM.prototype.initialize = function() {
  var optionContents;
  var initialDataLayer;
  if (this.options.initialDataLayer) {
    optionContents = this.options.initialDataLayer;
    if (Object.prototype.toString.call( optionContents ) === '[object Array]') {
      initialDataLayer = optionContents[1];
      initialDataLayer.event = optionContents[0];
    } else {
      initialDataLayer = optionContents;
    }
    push(initialDataLayer);
  }
  push({ 'gtm.start': Number(new Date()), event: 'gtm.js' });
  this.load(this.ready);
};

/**
 * Loaded?
 *
 * @api private
 * @return {boolean}
 */

GTM.prototype.loaded = function() {
  return !!(window.dataLayer && Array.prototype.push !== window.dataLayer.push);
};

/**
 * Page.
 *
 * @api public
 * @param {Page} page
 */

GTM.prototype.page = function(page) {
  var category = page.category();
  var name = page.fullName();
  var opts = this.options;

  // all
  if (opts.trackAllPages) {
    this.track(page.track());
  }

  // categorized
  if (category && opts.trackCategorizedPages) {
    this.track(page.track(category));
  }

  // named
  if (name && opts.trackNamedPages) {
    this.track(page.track(name));
  }
};

/**
 * Track.
 *
 * https://developers.google.com/tag-manager/devguide#events
 *
 * @api public
 * @param {Track} track
 */

GTM.prototype.track = function(track) {
  var props = track.properties();
  var userId = this.analytics.user().id();
  var anonymousId = this.analytics.user().anonymousId();
  if (userId) props.userId = userId;
  if (anonymousId) props.segmentAnonymousId = anonymousId;
  props.event = track.event();

  push(props);
};
