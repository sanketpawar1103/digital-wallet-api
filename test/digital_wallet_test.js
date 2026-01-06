import { assertEquals } from "jsr:@std/assert";
import {
  isValidName,
  isValidPassword,
  isValidPhone,
  isValidPin,
} from "../src/validation.js";

Deno.test("Checks for the user name validity", () => {
  assertEquals(isValidName("Snaket Pawar"), true);
});

Deno.test("Checks for the user name validity", () => {
  assertEquals(isValidName("Snaket Pawar _"), false);
});

Deno.test("Check mobile number validity(With valid phone number)", () => {
  assertEquals(isValidPhone("9850908332"), true);
});

Deno.test("Check mobile number validity(With invalid phone number)", () => {
  assertEquals(isValidPhone("0550908332"), false);
});

Deno.test("Check password validity(With valid password)", () => {
  assertEquals(isValidPassword("4912"), true);
});

Deno.test("Check password validity(With invalid password)", () => {
  assertEquals(isValidPassword("000"), false);
});

Deno.test("Check pin validity(With valid pin)", () => {
  assertEquals(isValidPin("4912"), true);
});

Deno.test("Check pin validity(With invalid password)", () => {
  assertEquals(isValidPin("000"), false);
});
