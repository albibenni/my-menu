interface ElementOptions {
  cls?: string | string[];
  text?: string;
  attr?: Record<string, string>;
}

function createElement(
  parent: HTMLElement,
  tag: string,
  options: ElementOptions = {},
): HTMLElement {
  const element = parent.ownerDocument.createElement(tag);
  const classes = typeof options.cls === "string" ? [options.cls] : options.cls;
  if (classes) element.classList.add(...classes);
  if (options.text !== undefined) element.textContent = options.text;
  for (const [name, value] of Object.entries(options.attr ?? {})) {
    element.setAttribute(name, value);
  }
  parent.append(element);
  return element;
}

Object.defineProperties(HTMLElement.prototype, {
  createEl: {
    configurable: true,
    value(this: HTMLElement, tag: string, options?: ElementOptions) {
      return createElement(this, tag, options);
    },
  },
  createDiv: {
    configurable: true,
    value(this: HTMLElement, options?: ElementOptions) {
      return createElement(this, "div", options);
    },
  },
});
