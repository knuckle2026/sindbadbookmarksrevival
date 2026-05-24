import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const pushMock = vi.fn();
const backMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, back: backMock }),
}));

const insertListingMock = vi.fn();
const insertCategoryMock = vi.fn();
const getUserMock = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: { getUser: getUserMock },
    from: (table: string) => {
      if (table === "listings") {
        return {
          insert: (payload: unknown) => {
            insertListingMock(payload);
            return {
              select: () => ({
                single: async () => ({
                  data: { id: "listing-1" },
                  error: null,
                }),
              }),
            };
          },
        };
      }
      if (table === "listing_categories") {
        return {
          insert: async (payload: unknown) => {
            insertCategoryMock(payload);
            return { error: null };
          },
        };
      }
      throw new Error(`unexpected table ${table}`);
    },
  }),
}));

import ListingForm, {
  type GenreOption,
  type CategoryOption,
} from "./ListingForm";

const GENRES_FIXTURE: GenreOption[] = [
  { id: "g-bar", slug: "bar-restaurant", name: "バー・飲食店" },
  { id: "g-massage", slug: "massage-urisen", name: "マッサージ・売り専" },
];

const CATEGORIES_FIXTURE: CategoryOption[] = [
  {
    id: "c-bar",
    slug: "bar",
    name: "バー",
    sortOrder: 1,
    genreSlug: "bar-restaurant",
  },
  {
    id: "c-izakaya",
    slug: "izakaya",
    name: "居酒屋",
    sortOrder: 2,
    genreSlug: "bar-restaurant",
  },
  {
    id: "c-massage",
    slug: "massage",
    name: "マッサージ",
    sortOrder: 1,
    genreSlug: "massage-urisen",
  },
];

beforeEach(() => {
  pushMock.mockClear();
  backMock.mockClear();
  insertListingMock.mockClear();
  insertCategoryMock.mockClear();
  getUserMock.mockReset();
  getUserMock.mockResolvedValue({ data: { user: { id: "user-1" } } });
});

describe("ListingForm", () => {
  it("必須未入力ならエラー表示して送信しない", async () => {
    render(
      <ListingForm genres={GENRES_FIXTURE} categories={CATEGORIES_FIXTURE} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "登録する" }));
    expect(await screen.findByText("名称は必須です")).toBeInTheDocument();
    expect(insertListingMock).not.toHaveBeenCalled();
  });

  it("ジャンル未選択ならエラー", async () => {
    render(
      <ListingForm genres={GENRES_FIXTURE} categories={CATEGORIES_FIXTURE} />,
    );
    fireEvent.input(screen.getAllByRole("textbox")[0], {
      target: { value: "テストバー" },
    });
    fireEvent.input(screen.getAllByRole("textbox")[2], {
      target: { value: "説明テキスト" },
    });
    fireEvent.input(
      screen.getByPlaceholderText("https://example.com"),
      { target: { value: "https://example.com" } },
    );
    fireEvent.click(screen.getByRole("button", { name: "登録する" }));
    expect(
      await screen.findByText("ジャンルを選択してください"),
    ).toBeInTheDocument();
    expect(insertListingMock).not.toHaveBeenCalled();
  });

  it("URL フォーマット不正ならエラー", async () => {
    render(
      <ListingForm genres={GENRES_FIXTURE} categories={CATEGORIES_FIXTURE} />,
    );
    fireEvent.input(screen.getAllByRole("textbox")[0], {
      target: { value: "T" },
    });
    fireEvent.input(screen.getAllByRole("textbox")[2], {
      target: { value: "D" },
    });
    fireEvent.input(
      screen.getByPlaceholderText("https://example.com"),
      { target: { value: "ftp://bad" } },
    );
    fireEvent.click(screen.getByRole("button", { name: "登録する" }));
    expect(
      await screen.findByText(/http\(s\):\/\/ から始まる必要/),
    ).toBeInTheDocument();
  });

  it("ジャンル選択でカテゴリが絞り込まれる", async () => {
    render(
      <ListingForm genres={GENRES_FIXTURE} categories={CATEGORIES_FIXTURE} />,
    );
    fireEvent.change(screen.getAllByRole("combobox")[0], {
      target: { value: "g-bar" },
    });
    expect(screen.getByRole("checkbox", { name: "バー" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "居酒屋" })).toBeInTheDocument();
    expect(
      screen.queryByRole("checkbox", { name: "マッサージ" }),
    ).toBeNull();
  });

  it("massage-urisen 選択時のみ出張エリアが表示される", async () => {
    render(
      <ListingForm genres={GENRES_FIXTURE} categories={CATEGORIES_FIXTURE} />,
    );
    expect(screen.queryByText("出張可能エリア（複数選択可）")).toBeNull();
    fireEvent.change(screen.getAllByRole("combobox")[0], {
      target: { value: "g-massage" },
    });
    expect(
      screen.getByText("出張可能エリア（複数選択可）"),
    ).toBeInTheDocument();
  });

  it("正常ケース: /api/listings へ POST され『投稿いただきました』完了画面に遷移", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: "listing-1", status: "pending" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <ListingForm genres={GENRES_FIXTURE} categories={CATEGORIES_FIXTURE} />,
    );
    fireEvent.input(screen.getAllByRole("textbox")[0], {
      target: { value: "テストバー" },
    });
    fireEvent.input(screen.getAllByRole("textbox")[2], {
      target: { value: "説明テキスト" },
    });
    fireEvent.input(
      screen.getByPlaceholderText("https://example.com"),
      { target: { value: "https://example.com" } },
    );
    fireEvent.change(screen.getAllByRole("combobox")[0], {
      target: { value: "g-bar" },
    });
    fireEvent.click(screen.getByRole("checkbox", { name: "バー" }));
    fireEvent.click(screen.getByRole("button", { name: "登録する" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/listings");
    expect((init as { method: string }).method).toBe("POST");
    const body = JSON.parse((init as { body: string }).body);
    expect(body).toMatchObject({
      genre_id: "g-bar",
      title: "テストバー",
      description: "説明テキスト",
      website_url: "https://example.com",
      category_ids: ["c-bar"],
    });

    // 完了画面が表示される (pending = 承認待ち)
    expect(
      await screen.findByText("情報登録を受け付けました。"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/運営事務局の承認後に公開されます/),
    ).toBeInTheDocument();

    vi.unstubAllGlobals();
  });
});
