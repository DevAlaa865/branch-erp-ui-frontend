import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { MasterDataService } from '../../../services/master-data.service';
import { BranchDailyTargetSeasonReportService } from '../../../services/reports/branch-daily-target-season-report.service';
import { CustomSelectComponent } from '../../../shared/custom-select/custom-select.component';

@Component({
  selector: 'app-branch-daily-target-season-report-result',
  standalone: true,
  imports:[CommonModule, FormsModule, ReactiveFormsModule, CustomSelectComponent],
  templateUrl: './branch-daily-target-season-report-result.component.html'
})
export class BranchDailyTargetSeasonReportResultComponent implements OnInit {

  form!: FormGroup;

  reportData: any[] = [];
  branchesList: any[] = [];

  filter: any;

  // ⭐ السلايدز
  selectedSlides: any[] = [];
  currentSlideIndex = 0;
  showSlide = false;
  autoSlideInterval: any;

  // ⭐ الباجينيشن
  currentPage = 1;
  pageSize = 14;

  constructor(
    private route: ActivatedRoute,
    private reportService: BranchDailyTargetSeasonReportService,
    private masterService: MasterDataService
  ) {}

  ngOnInit(): void {

    // ⭐ إنشاء الـ FormGroup
    this.form = new FormGroup({
      date: new FormControl(null),
      branchId: new FormControl(null),
      achievement: new FormControl(null)
    });

    const query = this.route.snapshot.queryParams;

    const filter = {
      fromDate: query['fromDate'],
      toDate: query['toDate'],
      cityIds: query['cityIds']?.split(',').map(Number),
      branchIds: query['branchIds'] ? [Number(query['branchIds'])] : []
    };

    // ⭐ تحميل التقرير
    this.reportService.getReport(filter).subscribe(res => {
      this.reportData = res;

      // ⭐ تحميل الفروع
      this.masterService.getBranches().subscribe(branchRes => {

        const branches = branchRes.data || branchRes || [];
        this.branchesList = branches;

        this.reportData = this.reportData.map(r => {
          const match = branches.find((b: any) => b.id === r.branchId);
          return {
            ...r,
            branchId: Number(r.branchId),   // ⭐ إصلاح الفلترة
            branchNumber: match ? match.branchNumber : null,
            date: filter.fromDate
          };
        });

      });

    });

    this.filter = filter;
  }

  // ⭐ دالة الفلترة الأساسية
  get filteredData() {

    const selectedDate = this.form.value.date;
    const selectedBranch = this.form.value.branchId;
    const selectedAchievement = this.form.value.achievement;

    return this.reportData.filter(r => {

      const matchDate =
        selectedDate ? r.date === selectedDate : true;

      const matchBranch =
        selectedBranch ? r.branchId === selectedBranch : true;

      const matchAchievement =
        selectedAchievement === 'low'
          ? r.achievementPercentage < 85
          : selectedAchievement === 'mid'
            ? r.achievementPercentage >= 85 && r.achievementPercentage < 100
            : selectedAchievement === 'high'
              ? r.achievementPercentage >= 100
              : true;

      return matchDate && matchBranch && matchAchievement;
    });
  }

  get paginatedData() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredData.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.filteredData.length / this.pageSize);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  // ⭐ زر عرض النتائج
  applyFilters() {
    console.log("🔍 الفلاتر المختارة:");
    console.log("اليوم:", this.form.value.date);
    console.log("الفرع:", this.form.value.branchId);
    console.log("نسبة الإنجاز:", this.form.value.achievement);

    const result = this.filteredData;

    console.log("📊 عدد النتائج بعد الفلترة:", result.length);
    console.log("📄 النتائج:", result);

    this.currentPage = 1;
  }

  // ⭐ مجموعات الأداء
  get excellentBranches() {
    return this.reportData.filter(r => r.achievementPercentage >= 100);
  }

  get veryGoodBranches() {
    return this.reportData.filter(r => r.achievementPercentage >= 85 && r.achievementPercentage < 100);
  }

  get needsImprovementBranches() {
    return this.reportData.filter(r => r.achievementPercentage < 85);
  }

  // ⭐ فتح السلايدز
  openSlides(type: 'low' | 'mid' | 'high') {
    if (type === 'low') {
      this.selectedSlides = this.reportData.filter(r => r.achievementPercentage < 85);
    } else if (type === 'mid') {
      this.selectedSlides = this.reportData.filter(r => r.achievementPercentage >= 85 && r.achievementPercentage < 100);
    } else {
      this.selectedSlides = this.reportData.filter(r => r.achievementPercentage >= 100);
    }

    this.currentSlideIndex = 0;
    this.showSlide = true;

    this.startAutoSlide();
  }

  startAutoSlide() {
    this.stopAutoSlide();
    this.autoSlideInterval = setInterval(() => {
      if (this.selectedSlides.length > 0) {
        this.currentSlideIndex =
          (this.currentSlideIndex + 1) % this.selectedSlides.length;
      }
    }, 5000);
  }

  stopAutoSlide() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
      this.autoSlideInterval = null;
    }
  }

  nextSlide() {
    if (this.selectedSlides.length > 0) {
      this.currentSlideIndex =
        (this.currentSlideIndex + 1) % this.selectedSlides.length;
    }
  }

  prevSlide() {
    if (this.selectedSlides.length > 0) {
      this.currentSlideIndex =
        (this.currentSlideIndex - 1 + this.selectedSlides.length) %
        this.selectedSlides.length;
    }
  }

  closeSlides() {
    this.showSlide = false;
    this.stopAutoSlide();
  }
}
