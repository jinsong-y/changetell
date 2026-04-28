# 时辰起卦重复提示与报数引导设计

## Goal

入口继续优先引导用户使用时间起卦。若同一时辰内对同一问题重复使用时间起卦，页面不立即再次起卦，而是提示“同一时辰内相同问题不宜重复起卦”，并引导用户改用报数起卦。报数起卦需要说明三个数字如何填写，并限制输入为 1 到 999 的整数。

## User Experience

默认状态保持“时间起卦”选中。入口文案强调“以当前时辰起卦”，报数起卦作为替代方式，不喧宾夺主。

当用户在同一时辰内用相同问题再次点击时间起卦时，进入半拦截状态：

- 显示提示：`同一时辰内相同问题不宜重复起卦。若此念已变，可改用报数起卦。`
- 主操作：`改用报数起卦`
- 次操作：`仍用时辰起卦`

点击“改用报数起卦”后自动切到报数起卦，并展开数字输入。点击“仍用时辰起卦”则继续提交时间起卦。

## Number Guidance

报数说明文案：

`静心后，随心写下 2 到 3 个整数。不必计算，不必选吉数。`

三个输入含义：

- `上卦数`：必填，随心写下第一个整数。
- `下卦数`：必填，随心写下第二个整数。
- `动爻数`：可选，随心写下第三个整数；不填则以前两数相加定动爻。

输入范围：

- 只允许 1 到 999 的整数。
- 不允许 0、负数、小数、中文数字、空值。
- 上卦数和下卦数缺失或非法时，报数起卦按钮不可提交。
- 动爻数为空合法；若填写，则必须是 1 到 999 的整数。

错误文案：

- 上卦数或下卦数非法：`上卦数和下卦数需填写 1 到 999 的整数`
- 动爻数非法：`动爻数如填写，也需是 1 到 999 的整数`

## Architecture

重复判定放在前端本地完成，不需要服务器存储。`App` 保存或读取最近一次时间起卦记录，记录内容包括：

- 标准化问题文本
- 起卦方式
- 时辰键

问题标准化规则：`trim` 后将连续空白压缩为单个空格。

时辰键用当前时间按传统十二时辰归并，不使用分钟秒。建议格式：

`YYYY-MM-DD:<zhi-hour-index>`

其中日期按本地时间取自然日，`zhi-hour-index` 取 0 到 11。此键只用于“同一时辰”重复提醒，不参与后端排卦公式。

`InputView` 负责展示当前方式、报数说明、输入错误和半拦截 UI。`App` 负责判断是否重复，并决定是提交、提示，还是切换报数方式。

后端保留现有防线，继续校验报数起卦至少有上卦数和下卦数。后端新增或收紧校验到 1 到 999，避免绕过前端直接请求。

## Data Flow

时间起卦正常路径：

1. 用户输入问题。
2. 默认方式为 `time`。
3. 点击起卦。
4. 若不是同一时辰同一问题，提交 `/api/chat`。
5. 成功后记录本次时间起卦的标准化问题与时辰键。

时间起卦重复路径：

1. 用户输入与上次相同的问题。
2. 当前时辰键与上次相同。
3. 点击起卦时不提交请求。
4. 展示半拦截提示。
5. 用户选择报数或继续时辰。

报数起卦路径：

1. 用户切换到 `numbers`。
2. 页面展示报数说明和三个输入。
3. 前端按位置解析数字，不压缩空格导致错位。
4. 上卦数、下卦数合法后允许提交。
5. 动爻数为空时不发送第三个数；填写合法时发送第三个数。

## Testing

Add deterministic tests for:

- `getNumberCastPayload(['1', '8', '6'])` returns `[1, 8, 6]`.
- `getNumberCastPayload(['1', '8', ''])` returns `[1, 8]`.
- `getNumberCastPayload(['1', '', '6'])` cannot cast.
- `0`、负数、小数、`1000` cannot cast.
- `999` can cast.
- repeated same question and same hour returns repeat warning state.
- different question in same hour does not warn.
- same question in different hour does not warn.
- backend validation rejects number casts outside 1 to 999.

Run:

```bash
npm run test:meihua
npm run lint
npm run build
```

## Acceptance Criteria

- Time casting remains default and visually primary.
- Same-question same-hour time recast shows the warning before submitting.
- Warning gives clear path to number casting and a secondary continue action.
- Number casting explains all three fields.
- Number inputs only accept valid integers from 1 to 999.
- Backend rejects invalid number payloads even if frontend is bypassed.
- Existing Meihua result flow remains unchanged.
