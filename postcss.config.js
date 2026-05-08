export default {
  syntax: 'postcss-scss',
  plugins: {
    'postcss-sorting': {
      // order: ['custom-properties', 'dollar-variables', 'declarations', 'rules', 'at-rules'],
      'properties-order': [
        // display
        'content',
        'display',
        'position',
        'box-sizing',
        'visibility',
        'appearance',
        'float',
        'clear',
        'direction',
        'vertical-align',

        // overflow
        'overflow',
        'overflow-x',
        'overflow-y',

        // flexbox
        'flex',
        'flex-basis',
        'flex-direction',
        'flex-flow',
        'flex-grow',
        'flex-shrink',
        'flex-wrap',
        'justify-content',
        'align-content',
        'align-items',
        'align-self',
        'justify-items',
        'justify-self',
        'place-content',
        'place-items',
        'place-self',
        'order',

        // grid
        'grid',
        'grid-area',
        'grid-template',
        'grid-template-areas',
        'grid-template-rows',
        'grid-template-columns',
        'grid-column',
        'grid-column-start',
        'grid-column-end',
        'grid-row',
        'grid-row-start',
        'grid-row-end',
        'grid-auto-rows',
        'grid-auto-columns',
        'grid-auto-flow',
        'grid-gap',
        'grid-row-gap',
        'grid-column-gap',

        // columns
        'columns',
        'column-count',
        'column-fill',
        'column-rule',
        'column-rule-width',
        'column-rule-style',
        'column-rule-color',
        'column-span',
        'column-width',

        // gaps
        'gap',
        'row-gap',
        'column-gap',

        // container queries
        'container',
        'container-type',
        'container-name',

        // position
        'top',
        'bottom',
        'left',
        'right',
        'inset',
        'inset-block',
        'inset-inline',
        'z-index',

        // size
        'width',
        'min-width',
        'max-width',
        'height',
        'min-height',
        'max-height',
        'aspect-ratio',
        'object-fit',
        'object-position',

        // padding
        'padding',
        'padding-top',
        'padding-bottom',
        'padding-left',
        'padding-right',
        'padding-block',
        'padding-block-start',
        'padding-block-end',
        'padding-inline',
        'padding-inline-start',
        'padding-inline-end',

        // margin
        'margin',
        'margin-top',
        'margin-bottom',
        'margin-left',
        'margin-right',
        'margin-block',
        'margin-block-start',
        'margin-block-end',
        'margin-inline',
        'margin-inline-start',
        'margin-inline-end',

        // background
        'background',
        'background-color',
        'background-image',
        'background-origin',
        'background-size',
        'background-position',
        'background-repeat',
        'background-attachment',
        'background-clip',

        // border
        'border',
        'border-top',
        'border-right',
        'border-bottom',
        'border-left',

        'border-width',
        'border-top-width',
        'border-right-width',
        'border-bottom-width',
        'border-left-width',

        'border-style',
        'border-top-style',
        'border-right-style',
        'border-bottom-style',
        'border-left-style',

        'border-color',
        'border-top-color',
        'border-right-color',
        'border-bottom-color',
        'border-left-color',

        'border-image',
        'border-image-source',
        'border-image-width',
        'border-image-outset',
        'border-image-repeat',
        'border-image-slice',

        'border-radius',
        'border-top-left-radius',
        'border-top-right-radius',
        'border-bottom-left-radius',
        'border-bottom-right-radius',
        'border-block',
        'border-inline',

        // outline
        'outline',
        'outline-offset',
        'outline-width',
        'outline-style',
        'outline-color',

        // appearance
        'resize',
        'stroke',
        'fill',
        'box-shadow',
        'filter',
        'backdrop-filter',
        'opacity',

        // tables
        'caption-side',
        'table-layout',
        'border-collapse',
        'border-spacing',
        'empty-cells',

        // list
        'list-style',
        'list-style-type',
        'list-style-position',
        'list-style-image',

        // transform
        'transform',
        'transform-origin',
        'transform-style',

        'backface-visibility',
        'perspective',
        'perspective-origin',

        // transition
        'transition',
        'transition-delay',
        'transition-duration',
        'transition-property',
        'transition-timing-function',

        // animation
        'animation',
        'animation-name',
        'animation-duration',
        'animation-timing-function',
        'animation-delay',
        'animation-iteration-count',
        'animation-direction',
        'animation-fill-mode',
        'animation-play-state',
        'will-change',

        // scroll
        'scroll-behavior',
        'scroll-snap-type',
        'scroll-snap-align',
        'scroll-snap-stop',
        'overscroll-behavior',
        'overscroll-behavior-x',
        'overscroll-behavior-y',

        // interaction
        'touch-callout',
        'user-select',
        'pointer-events',
        'cursor',
        'touch-action',

        // fonts
        'font',
        'font-family',
        'font-feature-settings',
        'font-size',
        'font-size-adjust',
        'line-height',
        'font-weight',
        'font-style',
        'font-stretch',
        'osx-font-smoothing',
        'font-smoothing',
        '-webkit-font-smoothing',
        'font-variant',
        'letter-spacing',

        // text
        'tab-size',
        'text-align',
        'text-align-last',
        'text-justify',
        'text-indent',
        'text-decoration',
        'text-decoration-color',
        'text-decoration-line',
        'text-decoration-style',
        'text-decoration-thickness',
        'text-underline-offset',
        'text-overflow',
        'text-rendering',
        'text-transform',
        'text-shadow',
        'text-wrap',
        'word-spacing',
        'white-space',
        'word-break',
        'word-wrap',
        'overflow-wrap',
        'hyphens',

        // color
        'color',
        'color-scheme',
        'accent-color',
        'caret-color',
        'forced-color-adjust',

        // misc
        'quotes',
        'counter-reset',
        'counter-increment',
        'page-break-before',
        'page-break-after',
        'page-break-inside',
      ],
    },
  },
};
