import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { PublicLayout } from "./PublicLayout";

describe("PublicLayout", () => {
  it("renders the outlet content", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<div data-testid="public">Public</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId("public")).toHaveTextContent("Public");
  });
});
