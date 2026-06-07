# TabberNeueVertical

Small add-on for [TabberNeue](https://www.mediawiki.org/wiki/Extension:TabberNeue) that adds opt-in vertical tab layouts without changing TabberNeue's parser syntax.

## Install

Put this folder in `extensions/TabberNeueVertical`, then load it after TabberNeue:

```php
wfLoadExtension( 'TabberNeue' );
wfLoadExtension( 'TabberNeueVertical' );
```

## Usage

Left-side tabs are the default vertical layout:

```html
<tabber class="tabber--vertical">
|-|First tab=
First content.
|-|Second tab=
Second content.
</tabber>
```

Right-side tabs are opt-in:

```html
<tabber class="tabber--vertical tabber--vertical-right">
|-|First tab=
First content.
|-|Second tab=
Second content.
</tabber>
```

`tabber--vertical-left` is still accepted as a backwards-compatible alias, but it is no longer needed.

Keep vertical layout on narrow screens:

```html
<tabber class="tabber--vertical tabber--vertical-keep">
|-|First tab=
First content.
|-|Second tab=
Second content.
</tabber>
```

Per-tabber sizing:

```html
<tabber class="tabber--vertical" style="--tabber-vertical-tab-width: 10rem; --tabber-vertical-tab-max-width: 14rem;">
|-|First tab=
First content.
|-|Second tab=
Second content.
</tabber>
```

## Notes

- This extension intentionally does not register a new parser tag.
- It uses the normal TabberNeue `<tabber>` syntax.
- Selectors are scoped to direct children so nested tabbers remain independent.
- Vertical tabbers explicitly show/hide their direct active panel instead of relying on TabberNeue's horizontal panel scroll position. This avoids the left-side layout bug where multiple tabs could appear to show the same panel.
