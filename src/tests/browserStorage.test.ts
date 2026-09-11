import { afterEach, describe, expect, it, vi } from "vitest";
import { browserStorage } from "../lib/browserStorage";
afterEach(()=>vi.unstubAllGlobals());
describe("optional browser storage",()=>{
 it("does not crash when storage access is denied",()=>{
  vi.stubGlobal("localStorage", {getItem(){throw new Error("Access denied");},setItem(){throw new Error("Quota exceeded");},removeItem(){throw new Error("Access denied");}});
  expect(browserStorage.getItem("logiclab-lang")).toBeNull();
  expect(()=>browserStorage.setItem("logiclab-lang","bn")).not.toThrow();
  expect(()=>browserStorage.removeItem("logiclab-theme")).not.toThrow();
 });
 it("preserves existing storage when it is available",()=>{
  const values=new Map([["logiclab-lang","en"]]);
  vi.stubGlobal("localStorage",{getItem:(k:string)=>values.get(k)??null,setItem:(k:string,v:string)=>values.set(k,v),removeItem:(k:string)=>values.delete(k)});
  expect(browserStorage.getItem("logiclab-lang")).toBe("en");browserStorage.setItem("logiclab-lang","bn");expect(values.get("logiclab-lang")).toBe("bn");
 });
});
