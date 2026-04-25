import { Directive, ElementRef, Renderer2, HostListener } from '@angular/core';

@Directive({
  selector: 'select[appFancySelect]',
  standalone: true
})
export class FancySelectDirective {

  private searchBuffer = '';
  private timeout: any;

  constructor(private el: ElementRef, private renderer: Renderer2) {

    const classes = [
      'w-full','px-4','py-3','rounded-xl','border','border-blue-300',
      'text-black','bg-white','shadow-md','outline-none','transition-all',
      'duration-200','focus:ring-2','focus:ring-blue-500','hover:shadow-lg',
      'hover:border-blue-400','cursor-pointer'
    ];

    classes.forEach(c => this.renderer.addClass(this.el.nativeElement, c));

    this.renderer.setStyle(this.el.nativeElement, 'appearance', 'none');
    this.renderer.setStyle(this.el.nativeElement, 'background-image',
      'url("data:image/svg+xml,%3Csvg width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%232563eb\' stroke-width=\'3\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'/%3E%3C/svg%3E")'
    );
    this.renderer.setStyle(this.el.nativeElement, 'background-repeat', 'no-repeat');
    this.renderer.setStyle(this.el.nativeElement, 'background-position', 'calc(100% - 12px) center');
  }

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    const select = this.el.nativeElement as HTMLSelectElement;

    if (event.key.length === 1) {
      this.searchBuffer += event.key.toLowerCase();
    } else if (event.key === 'Backspace') {
      this.searchBuffer = this.searchBuffer.slice(0, -1);
    } else {
      return;
    }

    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => this.searchBuffer = '', 700);

    const match = Array.from(select.options).find(o =>
      o.text.toLowerCase().startsWith(this.searchBuffer)
    );

    if (match) {
      select.value = match.value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
}
