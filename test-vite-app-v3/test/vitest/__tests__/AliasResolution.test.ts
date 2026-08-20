import { installQuasarPlugin } from "@quasar/quasar-app-extension-testing-unit-vitest";
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
// Resolved through the `@/` alias coming from quasar.config via
// quasarViteTestingConfig(), not through a relative path.
import EssentialLink from "@/components/EssentialLink.vue";

installQuasarPlugin();

describe("alias resolution", () => {
  it("resolves the @/ alias from the quasar config", () => {
    const wrapper = mount(EssentialLink, {
      props: {
        label: "Alias check"
      }
    });

    expect(wrapper.text()).toContain("Alias check");
  });
});
