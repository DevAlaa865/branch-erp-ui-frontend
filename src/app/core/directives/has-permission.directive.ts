import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Directive({
  selector: '[hasPermission]',
  standalone: true
})
export class HasPermissionDirective {

  private permissionCodes: string[] = [];

  constructor(
    private tpl: TemplateRef<any>,
    private vcr: ViewContainerRef,
    private auth: AuthService
  ) {}

  @Input() set hasPermission(code: string | string[]) {

    // لو جالك string → نحوله array
    if (typeof code === 'string') {
      this.permissionCodes = [code];
    } else {
      this.permissionCodes = code;
    }

    this.updateView();
  }

  private updateView() {
    this.vcr.clear();

    // لو أي صلاحية من اللي مبعوتة موجودة عند المستخدم → اعرض العنصر
    const canShow = this.permissionCodes.some(p =>
      this.auth.hasPermission(p)
    );

    if (canShow) {
      this.vcr.createEmbeddedView(this.tpl);
    }
  }
}
