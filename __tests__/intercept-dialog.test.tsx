import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockBack = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    back: mockBack,
  }),
}));

import { DialogContent } from "@/components/ui/dialog";
import { InterceptDialog } from "@/components/utils/intercept-dialog";

describe("InterceptDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should render children and be open by default", () => {
    render(
      <InterceptDialog>
        <DialogContent>
          <div data-testid="content">Dialog Content</div>
        </DialogContent>
      </InterceptDialog>,
    );

    expect(screen.getByTestId("content")).toBeInTheDocument();
  });

  it("should call router.back() when dialog closes via close button", async () => {
    const user = userEvent.setup();

    render(
      <InterceptDialog>
        <DialogContent>
          <div>Content</div>
        </DialogContent>
      </InterceptDialog>,
    );

    const closeButton = screen.getByRole("button", { name: /close/i });
    await user.click(closeButton);

    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it("should call router.back() when pressing Escape", async () => {
    const user = userEvent.setup();

    render(
      <InterceptDialog>
        <DialogContent>
          <div>Content</div>
        </DialogContent>
      </InterceptDialog>,
    );

    await user.keyboard("{Escape}");

    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
