import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MediaAssetService } from '../../Services/media-asset-service';
import { MediaAsset, AssetType, VideoQuality } from '../../Models/MediaAsset';

@Component({
  selector: 'app-media-asset-management-component',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './media-asset-management-component.html',
  styleUrl: './media-asset-management-component.css',
})
export class MediaAssetManagementComponent implements OnInit {
  contentId!: string;
  mediaAssets: MediaAsset[] = [];
  assetForm!: FormGroup;
  showModal = false;
  loading = false;

  assetTypes = Object.keys(AssetType);
  videoQualities = Object.keys(VideoQuality);

  isEditMode = false;
  selectedAssetId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private mediaAssetService: MediaAssetService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.contentId = params['contentId'];
      this.loadAssets();
    });

    this.initForm();
  }

  initForm(): void {
    this.assetForm = this.fb.group({
      title: ['', Validators.required],
      url: ['', [Validators.required, Validators.pattern('https?://.+')]],
      assetType: [AssetType.FEATURE_VIDEO, Validators.required],
      quality: [VideoQuality.FHD_1080P],
      languageCode: ['tr'],
      fileSizeBytes: [null],
      durationSeconds: [null]
    });
  }

  loadAssets(): void {
    this.loading = true;
    this.mediaAssetService.getAssetsByContentId(this.contentId).subscribe({
      next: (data) => {
        this.mediaAssets = data;
        this.loading = false;
        this.cdr.detectChanges();
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Medya varlıkları yüklenirken hata:', err);
        this.loading = false;
      }
    });
  }

  // Modal Açma (Ekleme Modu)
  openModal(): void {
    this.isEditMode = false;
    this.selectedAssetId = null;
    this.assetForm.reset({
      assetType: AssetType.FEATURE_VIDEO,
      quality: VideoQuality.FHD_1080P,
      languageCode: 'tr'
    });
    this.showModal = true;
  }

  // Modal Açma (Düzenleme Modu)
  openEditModal(asset: MediaAsset): void {
    this.isEditMode = true;
    this.selectedAssetId = asset.id!;

    this.assetForm.patchValue({
      title: asset.title,
      url: asset.url,
      assetType: asset.assetType,
      quality: asset.quality,
      languageCode: asset.languageCode,
      durationSeconds: asset.durationSeconds
    });

    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditMode = false;
    this.selectedAssetId = null;
    this.assetForm.reset();
  }

  onSubmit(): void {
    if (this.assetForm.invalid) return;

    const payload: MediaAsset = {
      ...this.assetForm.value,
      contentId: this.contentId
    };

    if (this.isEditMode && this.selectedAssetId) {
      this.mediaAssetService.updateMediaAsset(this.selectedAssetId, payload).subscribe({
        next: (updated) => {
          const index = this.mediaAssets.findIndex(a => a.id === this.selectedAssetId);
          if (index !== -1) {
            this.mediaAssets[index] = updated;
          }
          this.closeModal();
        },
        error: (err) => alert('Update failed: ' + err.message)
      });
    } else {
      this.mediaAssetService.addMediaAsset(payload).subscribe({
        next: (created) => {
          this.mediaAssets.push(created);
          this.closeModal();
        },
        error: (err) => alert('Creation failed: ' + err.message)
      });
    }
  }

  deleteAsset(id?: number): void {
    if (!id) return;
    if (confirm('Bu medya kaynağını silmek istediğinize emin misiniz?')) {
      this.mediaAssetService.deleteMediaAsset(id).subscribe({
        next: () => {
          this.mediaAssets = this.mediaAssets.filter(a => a.id !== id);
        },
        error: (err) => alert('Silme işlemi başarısız: ' + err.message)
      });
    }
  }
}
