import GlobalLogo from "../GlobalLogo";

type BrandProps = {
  className?: string;
  variant?: "header" | "footer";
};

export default function Brand({ className = "", variant = "header" }: BrandProps) {
  return <GlobalLogo className={className} variant={variant} />;
}
