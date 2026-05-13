import { QRCodeSVG } from "qrcode.react";
import { useRef } from "react";
import { IoQrCodeOutline } from "react-icons/io5";

export default function QRCode() {
  console.log("QRCode rendered");
  const ref = useRef();
  return (
    <>
      <button
        onClick={() => {
          ref.current?.showModal();
        }}
      >
        <IoQrCodeOutline size={20} />
      </button>
      <dialog ref={ref} className="modal p-0">
        <div className="modal-box w-100 max-w-[90%] bg-base-content text-base-100">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg">このページのQRCode</h3>
          <div className="flex flex-col items-center py-10">
            <QRCodeSVG value="https://masabando.github.io/oc2026/" bgColor="#ffffff00" />
          </div>
          <div className="text-sm text-center">
            https://masabando.github.io/oc2026/
          </div>
        </div>
        <form method="dialog" className="modal-backdrop h-dvh w-dvw">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
}
