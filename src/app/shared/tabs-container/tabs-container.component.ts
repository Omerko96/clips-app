import {
  Component,
  AfterContentInit,
  ContentChildren,
  QueryList,
} from '@angular/core';

import { TabComponent } from '../tab/tab.component';

@Component({
  selector: 'app-tabs-container',
  templateUrl: './tabs-container.component.html',
  styleUrls: ['./tabs-container.component.css'],
})
export class TabsContainerComponent implements AfterContentInit {
  @ContentChildren(TabComponent) tabs: QueryList<TabComponent> =
    new QueryList();

  ngAfterContentInit(): void {
    const activeTabs = this.tabs?.filter((tab: TabComponent) => tab.active);

    if (!activeTabs || activeTabs.length === 0) {
      this.selectTab(this.tabs.first);
    }
  }

  public selectTab(tab: TabComponent): boolean {
    this.tabs?.forEach((tab: TabComponent) => (tab.active = false));

    tab.active = true;

    return false;
  }
}
