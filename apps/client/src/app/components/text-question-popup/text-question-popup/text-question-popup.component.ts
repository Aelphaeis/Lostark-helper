import { Component, Input, OnInit } from "@angular/core";
import { NzModalRef } from "ng-zorro-antd/modal";
import { FormControl, Validators } from "@angular/forms";

@Component({
  selector: "lostark-helper-text-question-popup",
  templateUrl: "./text-question-popup.component.html",
  styleUrls: ["./text-question-popup.component.less"]
})
export class TextQuestionPopupComponent implements OnInit {

  @Input()
  baseText = "";

  @Input()
  placeholder = "";

  @Input()
  type: "textarea" | "input" = "textarea";

  public control!: FormControl;

  constructor(private modalRef: NzModalRef) {
  }

  public submit(): void {
    this.modalRef.close(this.control.value);
  }

  ngOnInit(): void {
    this.control = new FormControl(this.baseText, Validators.required);
  }

}
