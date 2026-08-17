package com.sangyunpark.backend.common.logging;

import com.sangyunpark.backend.common.logging.dto.request.LogTestRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/log-test")
@RequiredArgsConstructor
public class LogTestController {

    private final LogTestService logTestService;

    @PostMapping
    public ResponseEntity<Void> writeLog(@Valid @RequestBody LogTestRequest request) {
        logTestService.writeLog(request.level(), request.message());
        return ResponseEntity.ok().build();
    }
}
