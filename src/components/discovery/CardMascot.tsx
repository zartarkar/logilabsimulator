import { TenTen } from "./TenTen";

export function CardMascot({ bn }: { bn: boolean }) {
  return (
    <div className="ll-centered-mascot">
      <TenTen scene={0} reaction="idle" paused bn={bn} />
    </div>
  );
}
