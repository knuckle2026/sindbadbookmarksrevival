import { render, screen, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const rpcMock = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    rpc: rpcMock,
  }),
}));

import DashboardPage from "./page";

type Row = {
  genre_slug: string;
  genre_name: string;
  genre_sort: number;
  category_slug: string | null;
  category_name: string | null;
  category_sort: number | null;
  listing_count: number;
};

function row(partial: Partial<Row>): Row {
  return {
    genre_slug: "bar-restaurant",
    genre_name: "バー・飲食店",
    genre_sort: 1,
    category_slug: "bar",
    category_name: "バー",
    category_sort: 1,
    listing_count: 1,
    ...partial,
  };
}

describe("Dashboard top page (genre × category tree)", () => {
  beforeEach(() => {
    rpcMock.mockReset();
  });

  it("ジャンルセクション・カテゴリ・件数バッジ・リンクを描画する", async () => {
    rpcMock.mockResolvedValue({
      data: [
        row({
          genre_slug: "bar-restaurant",
          category_slug: "bar",
          category_name: "バー",
          category_sort: 1,
          listing_count: 3,
        }),
        row({
          genre_slug: "bar-restaurant",
          category_slug: "izakaya",
          category_name: "居酒屋",
          category_sort: 2,
          listing_count: 7,
        }),
      ],
      error: null,
    });

    render(await DashboardPage());

    expect(
      screen.getByRole("heading", { name: "ダッシュボード", level: 1 }),
    ).toBeInTheDocument();

    const genreLink = screen.getByRole("link", { name: "バー・飲食店" });
    expect(genreLink).toHaveAttribute("href", "/genres/bar-restaurant");

    const barLink = screen.getByRole("link", { name: /バー.*\(3\)/ });
    expect(barLink).toHaveAttribute(
      "href",
      "/genres/bar-restaurant?category=bar",
    );

    const izakayaLink = screen.getByRole("link", { name: /居酒屋.*\(7\)/ });
    expect(izakayaLink).toHaveAttribute(
      "href",
      "/genres/bar-restaurant?category=izakaya",
    );
  });

  it("カテゴリは category_sort 昇順で並ぶ", async () => {
    rpcMock.mockResolvedValue({
      data: [
        row({
          category_slug: "c-second",
          category_name: "二番目",
          category_sort: 5,
          listing_count: 1,
        }),
        row({
          category_slug: "c-first",
          category_name: "一番目",
          category_sort: 1,
          listing_count: 1,
        }),
      ],
      error: null,
    });

    render(await DashboardPage());

    const items = screen
      .getAllByRole("link")
      .filter((el) => /一番目|二番目/.test(el.textContent ?? ""));
    expect(items[0]).toHaveTextContent("一番目");
    expect(items[1]).toHaveTextContent("二番目");
  });

  it("カテゴリがないジャンルは空プレースホルダを表示する", async () => {
    rpcMock.mockResolvedValue({ data: [], error: null });

    render(await DashboardPage());

    const placeholders = screen.getAllByText("登録情報はまだありません");
    expect(placeholders.length).toBeGreaterThan(0);
  });

  it("'other' ジャンルはカテゴリ 0 件のとき非表示", async () => {
    rpcMock.mockResolvedValue({ data: [], error: null });

    render(await DashboardPage());

    expect(screen.queryByRole("link", { name: "その他" })).toBeNull();
  });

  it("RPC エラー時でも見出しは描画される", async () => {
    rpcMock.mockResolvedValue({ data: null, error: { message: "boom" } });

    render(await DashboardPage());

    expect(
      screen.getByRole("heading", { name: "ダッシュボード", level: 1 }),
    ).toBeInTheDocument();
  });
});
