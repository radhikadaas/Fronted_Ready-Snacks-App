import {
  Footer as FBFooter,
  FooterBrand,
  FooterCopyright,
  FooterDivider,
  FooterLink,
  FooterLinkGroup
} from "flowbite-react";

export default function Footer() {
  return (
    <FBFooter container={false} className="bg-gray-900 border-t border-gray-700 mt-20 py-10">
      <div className="w-full max-w-6xl mx-auto">

        {/* TOP SECTION: Logo Left + Links Right */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">

          {/* LOGO LEFT */}
          <FooterBrand
            href="/"
            src="/logo.png"    // Replace with your real logo
            alt="Snacks Logo"
            name="Snacks"
            className="flex items-center gap-2"
          />

          {/* LINKS RIGHT */}
          <FooterLinkGroup className="flex gap-6 text-gray-300 text-sm">
            <FooterLink href="#">About</FooterLink>
            <FooterLink href="#">Privacy Policy</FooterLink>
            <FooterLink href="#">Terms</FooterLink>
            <FooterLink href="#">Contact</FooterLink>
          </FooterLinkGroup>
        </div>

        {/* DIVIDER */}
        <FooterDivider className="my-6 border-gray-700" />

        {/* COPYRIGHT */}
        <div className="text-center">
          <FooterCopyright
            href="#"
            by="Snacks Company"
            year={new Date().getFullYear()}
            className="text-gray-400"
          />
        </div>

      </div>
    </FBFooter>
  );
}
