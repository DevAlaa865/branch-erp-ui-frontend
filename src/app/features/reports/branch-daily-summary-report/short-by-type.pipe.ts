import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shortByType',
  standalone: true
})
export class ShortByTypePipe implements PipeTransform {

  transform(shortages: any[] | null | undefined, typeId: number | null | undefined): any | null {

    // لو مفيش داتا أصلاً
    if (!shortages || !Array.isArray(shortages)) {
      return null;
    }

    // لو typeId مش رقم
    if (typeId === null || typeId === undefined) {
      return null;
    }

    // رجّع العنصر اللي نوعه مطابق
    return shortages.find(s => s.shortageTypeId === typeId) ?? null;
  }

}
