import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PickList } from './picklist';

@Component({
  imports: [PickList],
  template: `
    <syui-pick-list
      [(source)]="source"
      [(target)]="target"
      sourceHeader="Available"
      targetHeader="Selected"
    />
  `,
})
class Host {
  source = signal(['Keyboard', 'Mouse', 'Monitor']);
  target = signal(['Webcam']);
}

@Component({
  imports: [PickList],
  template: `
    <syui-pick-list [(source)]="source" [(target)]="target" showSourceControls="false" />
  `,
})
class HostWithoutSourceControls {
  source = signal(['A']);
  target = signal<string[]>([]);
}

describe('PickList', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    const lists = () => Array.from(root.querySelectorAll<HTMLElement>('[role="listbox"]'));
    const options = (list: number) =>
      Array.from(lists()[list].querySelectorAll<HTMLElement>('[role="option"]'));
    // Rendered order: to target, all to target, to source, all to source.
    const transferButtons = Array.from(
      root.querySelectorAll<HTMLButtonElement>('.syui-pick-list-transfer-controls button'),
    );
    return { fixture, root, lists, options, transferButtons };
  }

  it('renders source and target listboxes with headers and items', () => {
    const { root, lists, options } = setup();
    expect(lists().length).toBe(2);
    expect(lists().every((list) => list.getAttribute('aria-multiselectable') === 'true')).toBe(
      true,
    );
    expect(options(0).length).toBe(3);
    expect(options(1).length).toBe(1);
    const headers = root.querySelectorAll('.syui-pick-list-header');
    expect(headers[0].textContent).toContain('Available');
    expect(headers[1].textContent).toContain('Selected');
  });

  it('moves the selected items to the target', () => {
    const { fixture, options, transferButtons } = setup();
    options(0)[1].click(); // Mouse
    fixture.detectChanges();
    options(0)[2].dispatchEvent(new MouseEvent('click', { bubbles: true, ctrlKey: true }));
    fixture.detectChanges();

    transferButtons[0].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.source()).toEqual(['Keyboard']);
    expect(fixture.componentInstance.target()).toEqual(['Webcam', 'Mouse', 'Monitor']);
  });

  it('moves all items to the target and back to the source', () => {
    const { fixture, transferButtons } = setup();
    transferButtons[1].click(); // all to target
    fixture.detectChanges();
    expect(fixture.componentInstance.source()).toEqual([]);
    expect(fixture.componentInstance.target()).toEqual(['Webcam', 'Keyboard', 'Mouse', 'Monitor']);

    transferButtons[3].click(); // all to source
    fixture.detectChanges();
    expect(fixture.componentInstance.target()).toEqual([]);
    expect(fixture.componentInstance.source()).toEqual(['Webcam', 'Keyboard', 'Mouse', 'Monitor']);
  });

  it('moves a target selection back to the source', () => {
    const { fixture, options, transferButtons } = setup();
    options(1)[0].click(); // Webcam
    fixture.detectChanges();
    transferButtons[2].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.target()).toEqual([]);
    expect(fixture.componentInstance.source()).toEqual(['Keyboard', 'Mouse', 'Monitor', 'Webcam']);
  });

  it('reorders the target list with its reorder buttons', () => {
    const { fixture, root, options, transferButtons } = setup();
    transferButtons[1].click(); // all to target → Webcam, Keyboard, Mouse, Monitor
    fixture.detectChanges();
    options(1)[2].click(); // Mouse
    fixture.detectChanges();

    const targetControls = root.querySelectorAll('.syui-pick-list-controls');
    const topButton = targetControls[1].querySelectorAll('button')[0];
    topButton.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.target()).toEqual(['Mouse', 'Webcam', 'Keyboard', 'Monitor']);
  });

  it('hides the source reorder controls when showSourceControls is false', () => {
    const { root } = setup();
    expect(root.querySelectorAll('.syui-pick-list-controls').length).toBe(2);

    const fixture = TestBed.createComponent(HostWithoutSourceControls);
    fixture.detectChanges();
    const noControlsRoot: HTMLElement = fixture.nativeElement;
    expect(noControlsRoot.querySelectorAll('.syui-pick-list-controls').length).toBe(1);
  });
});
