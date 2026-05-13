import QRCode from "./QRCode";

export default function Menu() {
  return (
    <div className="navbar bg-base-100 shadow-sm sticky top-0 z-10">
      <div className="flex-1">
        <a className="btn btn-ghost text-xl">近大高専OC</a>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal px-1">
          <li>
            <details>
              <summary>Link</summary>
              <ul className="bg-base-100 rounded-t-none p-2">
                <li>
                  <a
                    className="whitespace-nowrap"
                    href="https://www.ktc.ac.jp/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    近大高専
                  </a>
                </li>
                <li>
                  <a
                    className="whitespace-nowrap"
                    href="https://www.ktc.ac.jp/nyushi/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    入試情報
                  </a>
                </li>
              </ul>
            </details>
          </li>
          <li>
            <QRCode />
          </li>
        </ul>
      </div>
    </div>
  );
}