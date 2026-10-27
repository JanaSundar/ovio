/**
 * Accessibility and design notes, written from each component's code. An interaction with no
 * entry gets no tab, rather than generic advice that may not hold for it.
 */

export const A11Y_NOTES: Record<string, string[]> = {
  "fluid-range-slider": [
    'Each thumb is role="slider" with aria-valuemin, -max, -now and -valuetext from formatValue; a range names its thumbs "minimum" and "maximum".',
    "Arrow keys move one step, Shift + arrows or Page Up / Page Down a tenth of the range, Home and End the ends.",
    "Thumbs can't cross: each one's min and max are the other's value, and the ARIA bounds say so.",
    "Under reduced motion the thumb jumps to its value with no spring and no stretch.",
  ],
  "context-menu": [
    'The area is focusable and announces aria-haspopup="menu"; Shift F10 or the ContextMenu key opens the menu at it.',
    "The menu keeps focus and points at the highlighted item with aria-activedescendant. Arrows, Home, End and typeahead move it; disabled items are skipped.",
    "Escape and Tab close it and return focus to the area; a click outside, a scroll or a resize close it too.",
    "Touch opens it with a long-press, cancelled if the finger moves more than 8px.",
  ],
  "peel-to-reveal": [
    "The corner is a real button named after the hidden content: Enter or Space peels the sticker off in one go.",
    "What the sticker covers is inert and hidden from screen readers until it is peeled, so its links can't be tabbed to through the sticker.",
    "Under reduced motion the corner jumps instead of springing.",
  ],
  testimonials: [
    'A section with aria-roledescription="carousel"; each card is a group labelled "n of N".',
    "Autoplay stops while the pointer is over it or focus is inside, has a pause button, and is off under reduced motion.",
    'The live region is polite while autoplay is stopped and "off" while it runs, so screen readers aren\'t interrupted every few seconds.',
    "Left and Right arrows move between quotes; the dots say which quote they show.",
  ],
  "physical-knob": [
    'role="slider" with aria-valuetext; arrow keys turn it, Home and End jump to the ends, and disabled sets aria-disabled.',
    "Reduced motion drops the inertia and the spring settle.",
  ],
  "compare-slider": [
    'The divider is role="slider" with its position as aria-valuenow; arrow keys move it and Home / End jump to either side.',
    "Reduced motion swaps its springs for instant moves.",
  ],
  "liquid-magnifier": [
    'The zoom is a role="slider"; + and - change it, announced through aria-keyshortcuts.',
    "Reduced motion stops the lens trailing the pointer.",
  ],
  "scratch-to-reveal": [
    "Enter or Space reveals everything at once, so nobody has to scratch.",
    "Reduced motion clears the coating without the fade-out animation.",
  ],
  "dial-menu": [
    'Opens as role="menu" with role="menuitem" items; Home, End, Enter and Escape work, and Tab leaves it.',
    "The trigger choice in the demo is a radio group.",
  ],
  "liquid-tabs": [
    "A tablist of tabs, each controlling its tabpanel through aria-controls and aria-labelledby.",
    'The deploy status is a role="status" region, so changes are announced.',
  ],
  "contribution-graph": [
    'The year is a role="grid" of rows; Home and End jump along a row, and each day is labelled with its date and count.',
  ],
  "star-history": ['The scrubber is role="slider" with the date and star count as aria-valuetext.'],
};

export const DESIGN_NOTES: Record<string, string[]> = {
  "fluid-range-slider": [
    "The thumb follows its value on a spring rather than snapping, so a click far down the track reads as travel, not teleport.",
    "Velocity stretches the droplet along the track and squashes it across, keeping its area: speed is visible, volume isn't.",
    "The value bubble and droplet share a goo filter, so the bubble pulls out of the thumb as one liquid shape instead of fading in beside it.",
  ],
  "context-menu": [
    "The menu grows from the corner nearest the pointer, flipping when the viewport is short, so it always appears to come from where you clicked.",
    "One highlight travels between items with a shared layout animation; hover and keyboard move the same highlight.",
    "Destructive items tint their highlight red rather than adding an icon.",
  ],
  "peel-to-reveal": [
    "The fold is the perpendicular bisector between the corner and the pointer, so the flap always lands exactly under the finger.",
    "The flap's shading runs from the fold to its tip in one gradient, which is what sells the curl.",
    "A resting dog-ear, deeper on hover, says where to start without a hint arrow.",
  ],
  testimonials: [
    "Cards behind the top one step down in scale and opacity, so the stack reads as a pile, not a row.",
    "A swipe passes on distance or on speed, so a short flick works as well as a long drag.",
  ],
};
