package com.sangyunpark.backend.asset.controller;

import com.sangyunpark.backend.asset.controller.dto.request.CashDepositRequest;
import com.sangyunpark.backend.asset.controller.dto.response.AssetResponse;
import com.sangyunpark.backend.asset.controller.dto.response.PendingAssetTransferResponse;
import com.sangyunpark.backend.asset.controller.dto.response.PortfolioAssetSummaryResponse;
import com.sangyunpark.backend.asset.service.AssetService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
public class AssetController {

    private static final String USER_ID = "userId";

    private final AssetService assetService;

    @GetMapping
    public List<AssetResponse> getAssets(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute(USER_ID);
        return assetService.getAssets(userId);
    }

    @GetMapping("/summary")
    public PortfolioAssetSummaryResponse getPortfolioAssetSummary(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute(USER_ID);
        return assetService.getPortfolioAssetSummary(userId);
    }

    @GetMapping("/transfers/pending")
    public List<PendingAssetTransferResponse> getPendingAssetTransfers(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute(USER_ID);
        return assetService.getPendingAssetTransfers(userId);
    }

    @PostMapping("/transfers/cash-deposits")
    public PendingAssetTransferResponse requestCashDeposit(
            HttpServletRequest request,
            @Valid @RequestBody CashDepositRequest cashDepositRequest
    ) {
        Long userId = (Long) request.getAttribute(USER_ID);
        return assetService.requestCashDeposit(userId, cashDepositRequest);
    }
}
