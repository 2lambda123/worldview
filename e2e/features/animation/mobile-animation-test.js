const TIME_LIMIT = 10000;

module.exports = {
  before: (c) => {
    c.url(`${c.globals.url}'?v=-82.73697802714918,27.137724977419197,-71.17181984959728,52.16591344371096&lg=false&t=2022-01-07-T15%3A27%3A49Z`);
    c.pause(10000);
    c.setWindowSize(375, 667);
    c.pause(10000);
  },

  //if this fails then the screen is not in mobile view
  'Check if coords case is not visible to see if screen is in desktop view.': (c) => {
    c.waitForElementNotVisible('#ol-coords-case', TIME_LIMIT);
  },

  'Check if timeline axis is visible to see if screen is in desktop view': (c) => {
    c.waitForElementNotPresent('.timeline-axis-container', TIME_LIMIT);
  },

  'Check for mobile timeline arrows to see if screen is in mobile view': (c) => {
    c.waitForElementVisible('.mobile-date-change-arrows-btn', TIME_LIMIT);
  },

  'Check for mobile animate button to see if screen is in mobile view': (c) => {
    c.waitForElementVisible('.mobile-animate-button', TIME_LIMIT);
  },

  'Mobile animate button opens widget': (c) => {
    c.waitForElementPresent('.mobile-date-picker-select-btn', TIME_LIMIT);
    c.useCss().click('.mobile-animate-button');
    c.pause(300);
    c.waitForElementPresent('#wv-animation-widget', TIME_LIMIT);
    c.expect.element('.custom-interval-delta-input').to.have.value.that.equals('1');
    c.expect.element('.dropdown-toggle').text.to.equal('DAY');
  },

  'Minimizing mobile animation widget opens collapsed animation widget': (c) => {
    c.useCss().click('.wv-minimize');
    c.waitForElementVisible('#collapsed-animate-widget-phone-portrait', TIME_LIMIT);
  },

  'Playing the animation changes the date of the mobile date picker': (c) => {
    c.useCss().click('#collapsed-animate-widget-phone-portrait');
    c.pause(3000);
    c.expect.element('.mobile-date-picker-select-btn-text span').text.to.equal('2022 JAN 17');
  },

  'Pressing the animation button brings up the mobile animation widget with the same information': (c) => {
    c.useCss().click('.mobile-animate-button');
    c.pause(300);
    c.waitForElementVisible('#wv-animation-widget', TIME_LIMIT);
    c.expect.element('#mobile-animation-start-date .mobile-date-picker-select-btn span').text.to.equal('2022 JAN 07');
    c.expect.element('#mobile-animation-end-date .mobile-date-picker-select-btn span').text.to.equal('2022 JAN 17');
  },

  after(c) {
    c.end();
  },
};
