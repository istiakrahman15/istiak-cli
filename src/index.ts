#!/usr/bin/env node
import "dotenv/config";
import { run } from "./cli.js";

run(process.argv).catch((err) => {
  console.error(err);
  process.exit(1);
});
