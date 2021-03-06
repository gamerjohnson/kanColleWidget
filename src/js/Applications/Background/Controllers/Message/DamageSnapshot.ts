import {Client} from "chomex";
import CaptureService from "../../../../Services/Capture";
import Rectangle from "../../../../Services/Rectangle";
import TempStorage from "../../../../Services/TempStorage";
import TrimService from "../../../../Services/Trim";
import WindowService from "../../../../Services/Window";
import { sleep } from "../../../../utils";
import Config from "../../../Models/Config";
import DamageSnapshotFrame, { DamageSnapshotType } from "../../../Models/DamageSnapshotFrame";

export async function DamageSnapshotCapture(message: {after: number, key: string}) {
  const ws = WindowService.getInstance();
  const tab = await ws.find();
  await sleep(message.after || 1000); // 艦隊の描画が止まるのを待つ
  const cs = new CaptureService();
  const original = await cs.base64(tab.windowId, {});
  const ts = await TrimService.init(original);
  const rect = Rectangle.new(ts.img.width, ts.img.height);
  const trimmed = ts.trim(rect.damagesnapshot());

  const key = message.key; // drawする画像を間違えないようにするためのkey
  switch (DamageSnapshotFrame.get().value) {
  case DamageSnapshotType.InApp:
    const height = Config.find<Config<number>>("inapp-dsnapshot-size").value;
    Client.for(chrome.tabs, tab.id, false).message("/snapshot/show", {uri: trimmed, height});
  case DamageSnapshotType.Separate:
    (new TempStorage()).store(`damagesnapshot_${key}`, trimmed);
  }
  return {status: 202, tabId: tab.id};
}

export async function DamageSnapshotRecord(message: any) {
  const {position, size} = message;
  const frame = DamageSnapshotFrame.get();
  frame.update({position, size});
  return { status: 200, frame };
}
