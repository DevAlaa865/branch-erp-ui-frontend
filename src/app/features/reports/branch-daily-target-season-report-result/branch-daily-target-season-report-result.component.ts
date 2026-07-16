import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BranchDailyTargetSeasonReportService } from '../../../services/reports/branch-daily-target-season-report.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MasterDataService } from '../../../services/master-data.service';

@Component({
  selector: 'app-branch-daily-target-season-report-result',
  imports:[CommonModule,FormsModule],
  standalone: true,
  templateUrl: './branch-daily-target-season-report-result.component.html'
})
export class BranchDailyTargetSeasonReportResultComponent implements OnInit {

  reportData: any[] = [];

  // ⭐ السلايدز
  selectedSlides: any[] = [];
  currentSlideIndex = 0;
  showSlide = false;
  autoSlideInterval: any;

  // 🔥 الباجينيشن
  currentPage = 1;
  pageSize = 14;

  get paginatedData() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.reportData.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.reportData.length / this.pageSize);
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

  constructor(
    private route: ActivatedRoute,
    private reportService: BranchDailyTargetSeasonReportService,
    private masterService:MasterDataService
  ) {}

  ngOnInit(): void {
    const query = this.route.snapshot.queryParams;

    const filter = {
      fromDate: query['fromDate'],
      toDate: query['toDate'],
      cityIds: query['cityIds']?.split(',').map(Number),
      branchIds: query['branchIds'] ? [Number(query['branchIds'])] : []
    };

  this.reportService.getReport(filter).subscribe(res => {
  this.reportData = res;

  // ⭐ تحميل بيانات الفروع للحصول على branchNumber
  this.masterService.getBranches().subscribe(branchRes => {

    const branches = branchRes.data || branchRes || [];

    this.reportData = this.reportData.map(r => {
      const match = branches.find((b: any) => b.id === r.branchId);
      return {
        ...r,
        branchNumber: match ? match.branchNumber : null
      };
    });

  });

});

  
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

  // ⭐ تشغيل تلقائي كل 5 ثواني
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

  // ⭐ التالي / السابق
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

  // ⭐ إغلاق السلايد
  closeSlides() {
    this.showSlide = false;
    this.stopAutoSlide();
  }
}
