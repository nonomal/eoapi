/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Direction, Directionality } from '@angular/cdk/bidi';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, Optional, ViewEncapsulation } from '@angular/core';
import { NzConfigKey, NzConfigService, WithConfig } from 'ng-zorro-antd/core/config';
import { NzDestroyService } from 'ng-zorro-antd/core/services';
import { BooleanInput } from 'ng-zorro-antd/core/types';
import { InputBoolean } from 'ng-zorro-antd/core/util';
import { takeUntil } from 'rxjs/operators';

import { EoNgCollapsePanelComponent } from './collapse-panel.component';

const NZ_CONFIG_MODULE_NAME: NzConfigKey = 'collapse';

@Component({
  selector: 'nz-collapse',
  exportAs: 'nzCollapse',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: ` <ng-content></ng-content> `,
  host: {
    class: 'ant-collapse',
    '[class.ant-collapse-icon-position-left]': `nzExpandIconPosition === 'left'`,
    '[class.ant-collapse-icon-position-right]': `nzExpandIconPosition === 'right'`,
    '[class.ant-collapse-ghost]': `nzGhost`,
    '[class.ant-collapse-borderless]': '!nzBordered',
    '[class.ant-collapse-rtl]': "dir === 'rtl'"
  },
  providers: [NzDestroyService],
  styleUrls: ['./collapse.component.scss']
})
export class EoNgCollapseComponent implements OnInit {
  readonly _nzModuleName: NzConfigKey = NZ_CONFIG_MODULE_NAME;
  static ngAcceptInputType_nzAccordion: BooleanInput;
  static ngAcceptInputType_nzBordered: BooleanInput;
  static ngAcceptInputType_nzGhost: BooleanInput;

  @Input() @WithConfig() @InputBoolean() nzAccordion: boolean = false;
  @Input() @WithConfig() @InputBoolean() nzBordered: boolean = true;
  @Input() @WithConfig() @InputBoolean() nzGhost: boolean = false;
  @Input() nzExpandIconPosition: 'left' | 'right' = 'left';

  dir: Direction = 'ltr';

  private listOfEoNgCollapsePanelComponent: EoNgCollapsePanelComponent[] = [];

  constructor(
    public nzConfigService: NzConfigService,
    private cdr: ChangeDetectorRef,
    @Optional() private directionality: Directionality,
    private destroy$: NzDestroyService
  ) {
    this.nzConfigService
      .getConfigChangeEventForComponent(NZ_CONFIG_MODULE_NAME)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.cdr.markForCheck();
      });
  }

  ngOnInit(): void {
    this.directionality.change?.pipe(takeUntil(this.destroy$)).subscribe((direction: Direction) => {
      this.dir = direction;
      this.cdr.detectChanges();
    });

    this.dir = this.directionality.value;
  }

  addPanel(value: EoNgCollapsePanelComponent): void {
    this.listOfEoNgCollapsePanelComponent.push(value);
  }

  removePanel(value: EoNgCollapsePanelComponent): void {
    this.listOfEoNgCollapsePanelComponent.splice(this.listOfEoNgCollapsePanelComponent.indexOf(value), 1);
  }

  click(collapse: EoNgCollapsePanelComponent): void {
    if (this.nzAccordion && !collapse.nzActive) {
      this.listOfEoNgCollapsePanelComponent
        .filter(item => item !== collapse)
        .forEach(item => {
          if (item.nzActive) {
            item.nzActive = false;
            item.nzActiveChange.emit(item.nzActive);
            item.markForCheck();
          }
        });
    }
    collapse.nzActive = !collapse.nzActive;
    collapse.nzActiveChange.emit(collapse.nzActive);
  }
}
