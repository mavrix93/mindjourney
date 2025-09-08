from typing import Generic, TypeVar, Optional

T = TypeVar("T")
E = TypeVar("E")


class Result(Generic[T, E]):
    """Simple Result type replacement for the removed 'returns' dependency.

    Provides a minimal API compatible with existing code that previously
    used `returns.result.Result/Success/Failure`:
      - is_successful()
      - value (property)
      - failure()
    """

    def __init__(self, is_success: bool, value: Optional[T] = None, error: Optional[E] = None) -> None:
        self._is_success = is_success
        self._value = value
        self._error = error

    def is_successful(self) -> bool:
        return self._is_success

    @property
    def value(self) -> T:
        return self._value  # type: ignore[return-value]

    def failure(self) -> E:
        return self._error  # type: ignore[return-value]


def Success(value: T) -> Result[T, E]:  # type: ignore[type-var]
    return Result(True, value=value)


def Failure(error: E) -> Result[T, E]:  # type: ignore[type-var]
    return Result(False, error=error)

