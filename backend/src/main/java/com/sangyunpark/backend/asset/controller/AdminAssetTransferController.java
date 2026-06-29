package com.sangyunpark.backend.asset.controller;

import com.sangyunpark.backend.asset.controller.dto.response.AdminAssetTransferResponse;
import com.sangyunpark.backend.asset.service.AssetService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/asset-transfers")
@RequiredArgsConstructor
public class AdminAssetTransferController {

    private static final String USER_ID = "userId";

    private final AssetService assetService;

    @GetMapping("/pending")
    public List<AdminAssetTransferResponse> getPendingAssetTransfers(HttpServletRequest request) {
        Long adminUserId = (Long) request.getAttribute(USER_ID);
        return assetService.getAdminPendingAssetTransfers(adminUserId);
    }

    @PostMapping("/{transferId}/approve")
    public AdminAssetTransferResponse approveAssetTransfer(
            HttpServletRequest request,
            @PathVariable Long transferId
    ) {
        Long adminUserId = (Long) request.getAttribute(USER_ID);
        return assetService.approveAssetTransfer(adminUserId, transferId);
    }

    @PostMapping("/{transferId}/reject")
    public AdminAssetTransferResponse rejectAssetTransfer(
            HttpServletRequest request,
            @PathVariable Long transferId
    ) {
        Long adminUserId = (Long) request.getAttribute(USER_ID);
        return assetService.rejectAssetTransfer(adminUserId, transferId);
    }
}
