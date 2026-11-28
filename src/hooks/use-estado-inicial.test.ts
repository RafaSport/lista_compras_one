import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useEstadoInicial } from "./use-estado-inicial";

describe("useEstadoInicial", () => {
  it("não chama a limpeza enquanto o componente está montado", () => {
    const aoZerar = vi.fn();
    renderHook(() => useEstadoInicial(aoZerar));

    expect(aoZerar).not.toHaveBeenCalled();
  });

  it("chama a limpeza uma vez ao desmontar", () => {
    const aoZerar = vi.fn();
    const { unmount } = renderHook(() => useEstadoInicial(aoZerar));

    unmount();

    expect(aoZerar).toHaveBeenCalledTimes(1);
  });

  it("usa a versão mais recente da função ao desmontar", () => {
    const primeira = vi.fn();
    const segunda = vi.fn();

    const { rerender, unmount } = renderHook(({ aoZerar }) => useEstadoInicial(aoZerar), {
      initialProps: { aoZerar: primeira },
    });

    rerender({ aoZerar: segunda });
    unmount();

    expect(primeira).not.toHaveBeenCalled();
    expect(segunda).toHaveBeenCalledTimes(1);
  });
});
