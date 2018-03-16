/* global describe, expect, it, jest */
import noUiSlider from 'nouislider';
import rangefield from '../../src/js/components/rangefield.js';

const emptyHtml = `<head></head><body></body>`;
const withTargetHtml = '<head></head><body>' +
  '<p class="form__field-description TestRange-range-description range-display" id="test-label">0</p>' +
  '<div data-range="rangefield" data-settings="TestRange" id="test-rangefield"></div>' +
  '<input type="hidden" class="range" name="TestRange" id="test-input"></body>';

const withTargetInputValueHtml = '<head></head><body>' +
  '<p class="form__field-description TestRange-range-description range-display" id="test-label">0</p>' +
  '<div data-range="rangefield" data-settings="TestRange" id="test-rangefield"></div>' +
  '<input type="hidden" value="33" class="range" name="TestRange" id="test-input"></body>';

const withTargetInputDualValueHtml = '<head></head><body>' +
  '<p class="form__field-description TestRange-range-description range-display" id="test-label">0</p>' +
  '<div data-range="rangefield" data-settings="TestRange" id="test-rangefield"></div>' +
  '<input type="hidden" value="50,75" class="range" name="TestRange" id="test-input"></body>';

const TEST_SETTINGS = {
  start: ["50.00"],
  snap: true,
  animate: true,
  animationDuration: 300,
  range: { min: 25, max: 75, '17%': 33, '50%': 50, '83%': 66 }
};

const TEST_SETTINGS_NO_START_ARRAY = {
  start: "50.00",
  snap: true,
  animate: true,
  animationDuration: 300,
  range: { min: 25, max: 75, '17%': 33, '50%': 50, '83%': 66 }
};

const TEST_SETTINGS_DUAL = {
  start: ["50.00", "75.00"],
  snap: true,
  animate: true,
  animationDuration: 300,
  range: { min: 25, max: 75, '17%': 33, '50%': 50, '83%': 66 }
};

const allWithSelector = selector => Array.from(document.querySelectorAll(selector));
const getRangefieldTargets = () => allWithSelector('div[data-range=rangefield]');
const getRangefieldInstances = () => allWithSelector('.noUi-target');
const setHtml = html => document.body.innerHTML = html;
const getHtml = html => document.body.innerHTML;
const giveItASecToMount = handler => setTimeout(handler, 1000);

const getMockMutationObserver = (callback) => ({
  callback,
  disconnect: jest.fn(),
  observe: jest.fn()
});

describe('rangefield', () => {

  beforeAll(() => {
    window.TestRange = TEST_SETTINGS;
  })

  it('mounts rangefield on any target element present on init', () => {
    setHtml(withTargetHtml);

    expect(getRangefieldTargets()).toHaveLength(1);
    expect(getRangefieldInstances()).toHaveLength(0);

    rangefield();

    expect(getRangefieldTargets()).toHaveLength(1);
    expect(getRangefieldInstances()).toHaveLength(1);
  });

  it('listens for rangefields added after init and mounts them', () => {
    const mockMutationObserver = getMockMutationObserver();
    const mockObserverFactory = jest.fn(() => mockMutationObserver);

    setHtml(emptyHtml);

    expect(getRangefieldTargets()).toHaveLength(0);
    expect(getRangefieldInstances()).toHaveLength(0);

    rangefield(mockObserverFactory);

    expect(mockMutationObserver.observe).toHaveBeenCalled();
    expect(getRangefieldTargets()).toHaveLength(0);
    expect(getRangefieldInstances()).toHaveLength(0);

    setHtml(withTargetHtml);

    const callback = mockObserverFactory.mock.calls[0][0];

    callback([], mockMutationObserver); //manually trigger the callback

    expect(getRangefieldTargets()).toHaveLength(1);
    expect(getRangefieldInstances()).toHaveLength(1);
  });

  it('creates a uiSlider with the settings from window', () => {
    const createSpy = jest.spyOn(noUiSlider, 'create');
    setHtml(withTargetInputValueHtml);

    rangefield();

    expect(createSpy).toHaveBeenLastCalledWith(expect.any(HTMLElement), TEST_SETTINGS)
    expect(getRangefieldTargets()).toHaveLength(1);
    expect(getRangefieldInstances()).toHaveLength(1);
  });

  it('does not do anything if there is nothing to do', () => {
    const createSpy = jest.spyOn(noUiSlider, 'create');
    const mockMutationObserver = getMockMutationObserver();
    const mockObserverFactory = jest.fn(() => mockMutationObserver);
    setHtml(withTargetInputValueHtml);

    rangefield();

    expect(createSpy).toHaveBeenLastCalledWith(expect.any(HTMLElement), TEST_SETTINGS)

    const html = getHtml()

    rangefield(mockObserverFactory);

    const html2 = getHtml()

    expect(html).toEqual(html2)

  });

  it('updates the settings to use the field value as start value if present', () => {
    const createSpy = jest.spyOn(noUiSlider, 'create');
    setHtml(withTargetInputValueHtml);

    const expectedSettings = Object.assign(TEST_SETTINGS, { start: ['33'] });

    rangefield();

    expect(createSpy).toHaveBeenLastCalledWith(expect.any(HTMLElement), expectedSettings)

    expect(getRangefieldTargets()).toHaveLength(1);
    expect(getRangefieldInstances()).toHaveLength(1);

    // Reset the test settings
    Object.assign(TEST_SETTINGS, { start: ['50.00'] });
  });

  it('updates the settings to use an array for the field value as start value if init is not an array', () => {
    window.TestRange = TEST_SETTINGS_NO_START_ARRAY;

    const createSpy = jest.spyOn(noUiSlider, 'create');
    setHtml(withTargetHtml);

    rangefield();

    expect(createSpy).toHaveBeenLastCalledWith(expect.any(HTMLElement), TEST_SETTINGS)

    expect(getRangefieldTargets()).toHaveLength(1);
    expect(getRangefieldInstances()).toHaveLength(1);
  });

  it('not convert the settings to an array to use the field value as start value if present', () => {
    window.TestRange = TEST_SETTINGS_DUAL;

    const createSpy = jest.spyOn(noUiSlider, 'create');
    setHtml(withTargetInputDualValueHtml);

    rangefield();

    expect(createSpy).toHaveBeenLastCalledWith(expect.any(HTMLElement), TEST_SETTINGS_DUAL)

    expect(getRangefieldTargets()).toHaveLength(1);
    expect(getRangefieldInstances()).toHaveLength(1);
  });

  it('updates with new settings if the values differ from the config', () => {
    window.TestRange = TEST_SETTINGS_DUAL;

    const createSpy = jest.spyOn(noUiSlider, 'create');
    setHtml(withTargetInputValueHtml);

    rangefield();

    expect(createSpy).toHaveBeenLastCalledWith(expect.any(HTMLElement), TEST_SETTINGS_DUAL)

    expect(getRangefieldTargets()).toHaveLength(1);
    expect(getRangefieldInstances()).toHaveLength(1);
  });
});