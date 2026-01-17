#include "crow/json.h"
#include <cassert>
#include <iostream>

void testJson() {
    // Test 1: Basic JSON creation
    crow::json::wvalue json;
    json["name"] = "John Doe";
    json["age"] = 30;
    crow::json::rvalue jsonRead = crow::json::load(json.dump());
    assert(static_cast<std::string>(jsonRead["name"]) == "John Doe");
    assert(static_cast<int>(jsonRead["age"]) == 30);

    // Test 2: JSON parsing
    auto parsed = crow::json::load("{\"id\": 1, \"status\": \"active\"}");
    assert(parsed);
    assert(static_cast<int>(parsed["id"]) == 1);
    assert(static_cast<std::string>(parsed["status"]) == "active");

    // Test 3: JSON serialization
    crow::json::wvalue toSerialize;
    toSerialize["success"] = true;
    toSerialize["message"] = "Test passed";
    std::string serialized = toSerialize.dump();
    assert(serialized == "{\"success\":true,\"message\":\"Test passed\"}");

    std::cout << "All JSON tests passed!\n";
}

int main() {
    testJson();
    return 0;
}