import { createContext, useContext, useState } from "react";

const TestContext = createContext();

export function TestProvider({ children }) {
  const [testInProgress, setTestInProgress] = useState(false);

  return (
    <TestContext.Provider value={{ testInProgress, setTestInProgress }}>
      {children}
    </TestContext.Provider>
  );
}

export function useTest() {
  return useContext(TestContext);
}
