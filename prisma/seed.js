// const { PrismaClient } = require("@prisma/client");
// const bcrypt = require("bcrypt");

// const prisma = new PrismaClient();

// async function main() {
//   const passwordHash = await bcrypt.hash("Admin@12345", 10);
//   await prisma.user.upsert({
//     where: { userId: "admin" },
//     update: {},
//     create: {
//       userId: "admin",
//       passwordHash,
//       role: "ADMIN"
//     }
//   });
//   console.log("Seeded admin user");
// }

// main()
//   .catch((error) => {
//     console.error(error);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Admin@12345", 10);

  await prisma.user.upsert({
    where: { userId: "admin" },
    update: {
      passwordHash,
      role: "ADMIN",
      email: "admin@gmail.com", // email-based login হলে এটা দরকার
    },
    create: {
      userId: "admin",
      email: "admin@gmail.com",
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log("Seeded/Updated admin user");

  const samplePosts = [
    {
      title: "How to Get Approved for Net-30 Terms in the US",
      slug: "get-approved-net-30-usa",
      excerpt:
        "Step-by-step playbook to secure Net-30 vendor accounts, build credit, and protect cash flow.",
      content: `# Net-30 approval without the guesswork

Net-30 vendors let you pay 30 days after invoice. Getting approved protects cash flow and strengthens your business credit profile.

## Build business credibility first
- Form an LLC and get an EIN
- Open a business bank account
- Use a professional address, phone, and domain-based email

## Add starter vendors
- Choose 3-5 starter accounts that report to bureaus
- Keep utilization under 30%
- Pay invoices 7-10 days early

## Prove payment history fast
Pay early for 90 days. Ask vendors to report and request a limit increase after your third on-time payment.

## Keep utilization healthy
- Track due dates inside your virtual office
- Automate reminders
- Download payment history for lenders

## Next step: apply for higher tiers
Once you have 5-8 tradelines, apply for fleet cards and low-limit business cards to diversify your profile.
`,
      tags: ["business credit", "net 30", "cash flow"],
      categories: ["Finance", "Operations"],
      coverImageUrl:
        "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80",
      metaImageUrl:
        "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80",
      metaTitle: "Get Approved for Net-30 Terms in the US",
      metaDescription:
        "A practical checklist to win Net-30 vendor approvals, build business credit, and protect cash flow.",
      publishedAt: new Date("2024-10-12T08:00:00.000Z"),
      status: "PUBLISHED",
      seoScore: 86,
      humanScore: 92,
      videoUrl: "https://www.youtube.com/embed/0gR0oQkaWds",
    },
    {
      title: "Why Business Credit Matters (Even If You’re Profitable)",
      slug: "build-business-credit-fast",
      excerpt:
        "Separate personal risk, secure better terms, and keep approvals moving with a clean credit stack.",
      content: `# Business credit is your silent partner

Strong business credit reduces personal guarantees, unlocks higher limits, and stabilizes vendor relationships.

## Benefits you feel quickly
- Better Net-30 and Net-60 approvals
- Lower deposit requirements for SaaS and logistics
- Faster onboarding with new vendors

## How to start in a week
- Register your business with accurate NAP (name, address, phone)
- Open a dedicated bank account and keep clean statements
- Add at least 3 tradelines that report

## Keep files ready
- EIN letter, Articles of Organization, and proof of address
- Past invoices and payment history exports

## Monitor and iterate
Review reports monthly. Dispute errors early. Rotate spend across tradelines to keep them active.
`,
      tags: ["business credit", "operations", "finance"],
      categories: ["Finance", "Strategy"],
      coverImageUrl:
        "https://images.unsplash.com/photo-1483478550801-ceba5fe50e8e?auto=format&fit=crop&w=1200&q=80",
      metaImageUrl:
        "https://images.unsplash.com/photo-1483478550801-ceba5fe50e8e?auto=format&fit=crop&w=1200&q=80",
      metaTitle: "Why Business Credit Matters (Even If You’re Profitable)",
      metaDescription:
        "Protect personal risk, unlock better terms, and speed vendor approvals with strong business credit.",
      publishedAt: new Date("2024-09-02T10:00:00.000Z"),
      status: "PUBLISHED",
      seoScore: 84,
      humanScore: 90,
    },
    {
      title: "AI + Virtual Office: Automate Docs Without Losing Control",
      slug: "ai-powered-virtual-office",
      excerpt:
        "Use AI to summarize, route, and secure documents while keeping human oversight.",
      content: `# Automate the boring parts safely

AI can summarize documents, flag risks, and route approvals—without replacing human oversight.

## Quick wins
- Auto-generate summaries for long PDFs
- Detect missing signatures or expired certificates
- Route Net-30 approvals to finance automatically

## Guardrails to keep
- Human-in-the-loop for final approvals
- Audit logs on every AI suggestion
- Role-based visibility for sensitive files

## Rollout plan
Start with low-risk documents, measure accuracy, then expand to finance and compliance packs.
`,
      tags: ["ai", "automation", "security"],
      categories: ["AI", "Productivity"],
      coverImageUrl:
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
      metaImageUrl:
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
      metaTitle: "AI + Virtual Office: Automate Docs Without Losing Control",
      metaDescription:
        "Use AI to summarize, route, and secure documents with human guardrails.",
      publishedAt: new Date("2024-08-15T09:00:00.000Z"),
      status: "PUBLISHED",
      seoScore: 82,
      humanScore: 88,
    },
  ];

  for (const post of samplePosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: post,
      create: post,
    });
  }

  console.log("Seeded sample blog posts");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
