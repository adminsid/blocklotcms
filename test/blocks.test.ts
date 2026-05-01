// ─────────────────────────────────────────────────────────────────────────────
// Unit tests: block registry & renderers
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect } from "vitest";
import { listBlockDefinitions, getBlockDefinition, renderBlock } from "../src/blocks/index.js";
import type { BlockType } from "../src/types.js";

const EXPECTED_TYPES: BlockType[] = [
  "mortgage-calculator",
  "listing-card",
  "listing-gallery",
  "property-search",
  "contact-form",
  "listing-flyer",
  "agent-profile",
  "hero-banner",
  "open-house-countdown",
  "neighborhood-stats",
];

describe("Block registry", () => {
  it("contains all expected block types", () => {
    const types = listBlockDefinitions().map(d => d.type);
    for (const t of EXPECTED_TYPES) {
      expect(types).toContain(t);
    }
  });

  it("getBlockDefinition returns the definition for a known type", () => {
    const def = getBlockDefinition("mortgage-calculator");
    expect(def).toBeDefined();
    expect(def?.type).toBe("mortgage-calculator");
    expect(typeof def?.render).toBe("function");
  });

  it("getBlockDefinition returns undefined for unknown type", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(getBlockDefinition("unknown-type" as any)).toBeUndefined();
  });

  it("renderBlock returns an error div for unknown type", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const html = renderBlock("unknown-type" as any, {});
    expect(html).toContain("Unknown block type");
  });
});

describe("Mortgage calculator block", () => {
  const def = getBlockDefinition("mortgage-calculator")!;

  it("renders with default config", () => {
    const html = def.render(def.defaultConfig);
    expect(html).toContain("blk-mortgage-calc");
    expect(html).toContain("Mortgage Calculator");
    expect(html).toContain("<input");
  });

  it("uses custom title", () => {
    const html = def.render({ ...def.defaultConfig, title: "My Custom Calculator" });
    expect(html).toContain("My Custom Calculator");
  });

  it("hides tax/insurance fields when showTaxInsurance is false", () => {
    const html = def.render({ ...def.defaultConfig, showTaxInsurance: false });
    // The input fields should not be present; CSS is always emitted
    expect(html).not.toContain('id="blk-mc-tax"');
    expect(html).not.toContain('id="blk-mc-ins"');
  });
});

describe("Listing card block", () => {
  const def = getBlockDefinition("listing-card")!;

  it("renders placeholder when no listing provided", () => {
    const html = def.render({ ...def.defaultConfig, listing: null });
    expect(html).toContain("No listing data provided");
  });

  it("renders listing data", () => {
    const html = def.render({
      ...def.defaultConfig,
      listing: {
        ListingKey: "L001",
        StandardStatus: "Active",
        ListPrice: 450000,
        City: "Denver",
        StateOrProvince: "CO",
        PostalCode: "80202",
        PropertyType: "Residential",
        BedroomsTotal: 3,
        BathroomsTotalInteger: 2,
        LivingArea: 1800,
      },
    });
    expect(html).toContain("$450,000");
    expect(html).toContain("Denver");
    expect(html).toContain("3");
  });
});

describe("Property search block", () => {
  const def = getBlockDefinition("property-search")!;

  it("renders a search form", () => {
    const html = def.render(def.defaultConfig);
    expect(html).toContain('<form');
    expect(html).toContain("type=\"search\"");
    expect(html).toContain("/listings/search");
  });

  it("respects custom searchResultsUrl", () => {
    const html = def.render({ ...def.defaultConfig, searchResultsUrl: "/custom-search" });
    expect(html).toContain("/custom-search");
  });
});

describe("Hero banner block", () => {
  const def = getBlockDefinition("hero-banner")!;

  it("renders headline and CTA", () => {
    const html = def.render(def.defaultConfig);
    expect(html).toContain("Your Next Home Starts Here");
    expect(html).toContain("Start Searching");
  });

  it("uses background image style when provided", () => {
    const html = def.render({ ...def.defaultConfig, backgroundImage: "https://example.com/bg.jpg" });
    expect(html).toContain("https://example.com/bg.jpg");
  });
});

describe("Contact form block", () => {
  const def = getBlockDefinition("contact-form")!;

  it("renders form fields", () => {
    const html = def.render(def.defaultConfig);
    expect(html).toContain("type=\"email\"");
    expect(html).toContain("type=\"text\"");
    expect(html).toContain("Equal Housing");
  });

  it("omits showing field when disabled", () => {
    const html = def.render({ ...def.defaultConfig, showScheduleShowing: false });
    expect(html).not.toContain("showingDate");
  });

  it("shows agent info when provided", () => {
    const html = def.render({ ...def.defaultConfig, agentName: "Jane Realtor", agentPhone: "555-0100" });
    expect(html).toContain("Jane Realtor");
    expect(html).toContain("555-0100");
  });
});

describe("Listing flyer block", () => {
  const def = getBlockDefinition("listing-flyer")!;

  it("renders price and address from listing data", () => {
    const html = def.render({
      ...def.defaultConfig,
      listing: {
        ListingKey: "F001",
        StandardStatus: "Active",
        ListPrice: 799000,
        StreetNumber: "42",
        StreetName: "Oak Avenue",
        City: "Boulder",
        StateOrProvince: "CO",
        PostalCode: "80301",
        PropertyType: "Residential",
        BedroomsTotal: 4,
        BathroomsTotalInteger: 3,
        LivingArea: 2400,
        YearBuilt: 2005,
      },
    });
    expect(html).toContain("$799,000");
    expect(html).toContain("Boulder");
    expect(html).toContain("42 Oak Avenue");
  });
});

describe("Agent profile block", () => {
  const def = getBlockDefinition("agent-profile")!;

  it("renders agent name and title", () => {
    const html = def.render(def.defaultConfig);
    expect(html).toContain("Alex Rivera");
    expect(html).toContain("Licensed Real Estate Agent");
  });

  it("renders specialties", () => {
    const html = def.render({
      ...def.defaultConfig,
      specialties: ["Luxury Homes", "Investment Properties"],
    });
    expect(html).toContain("Luxury Homes");
    expect(html).toContain("Investment Properties");
  });
});

describe("Open house countdown block", () => {
  const def = getBlockDefinition("open-house-countdown")!;

  it("renders with a future event date", () => {
    const html = def.render({ ...def.defaultConfig, eventDate: "2099-06-15T14:00:00", address: "100 Test St" });
    expect(html).toContain("blk-openhouse");
    expect(html).toContain("100 Test St");
    expect(html).toContain("blk-openhouse__timer");
  });

  it("renders without countdown when no date", () => {
    const html = def.render({ ...def.defaultConfig, eventDate: "" });
    // Timer HTML elements should not be present (CSS class is always emitted, HTML element is not)
    expect(html).not.toContain('class="blk-openhouse__timer"');
    expect(html).not.toContain('class="blk-openhouse__num"');
  });
});

describe("Neighborhood stats block", () => {
  const def = getBlockDefinition("neighborhood-stats")!;

  it("renders stat cards", () => {
    const html = def.render(def.defaultConfig);
    expect(html).toContain("blk-nbstats");
    expect(html).toContain("Median List Price");
  });

  it("shows up/down trend icons", () => {
    const html = def.render(def.defaultConfig);
    expect(html).toContain("↑");
    expect(html).toContain("↓");
  });
});
