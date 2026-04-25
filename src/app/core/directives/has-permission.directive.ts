import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Directive({
  selector: '[hasPermission]',
  standalone: true
})
export class HasPermissionDirective {

  private permissionCode: string | null = null;

  constructor(
    private tpl: TemplateRef<any>,
    private vcr: ViewContainerRef,
    private auth: AuthService
  ) {}

  @Input() set hasPermission(code: string) {
    this.permissionCode = code;
    this.updateView();
  }

  private updateView() {
    this.vcr.clear();

    if (this.permissionCode && this.auth.hasPermission(this.permissionCode)) {
      this.vcr.createEmbeddedView(this.tpl);
    }
  }
}
