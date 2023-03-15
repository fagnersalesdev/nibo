export const calculateTimeElapsed = () => {
  const startTime = Date.now()

  return () => Date.now() - startTime
}