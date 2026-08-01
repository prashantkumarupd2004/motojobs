/**
 * Auth screens are full-viewport by design (AuthShell paints its own brand
 * panel), so they deliberately sit outside the public layout's navbar/footer
 * chrome rather than nesting inside it.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="bg-canvas">{children}</div>;
}
