import { components as Anti } from "@antispace/sdk"
import { serve } from "@hono/node-server"
import { Hono } from "hono"
import { cors } from "hono/cors"

const app = new Hono()

app.use("*", cors())

app.get("/", (c) => {
  return c.text("alive")
})

app.post("/ui/widget", async (c) => {
  const body = await c.req.json()
  const { action } = body || {}

  if (action === "nope") {
    return c.text((<Anti.Text type="heading1">Nope</Anti.Text>) as any)
  }

  return c.text(
    (
      <Anti.Column padding="none" width="full">
        <Anti.Text type="heading2">Rows</Anti.Text>

        <Anti.Row>
          <Anti.Text>Default Row</Anti.Text>
        </Anti.Row>
        <Anti.Row align="center" width="full">
          <Anti.Text>Center Aligned Row</Anti.Text>
        </Anti.Row>
        <Anti.Row align="bottom" width="full">
          <Anti.Text>Bottom Aligned Row</Anti.Text>
        </Anti.Row>

        <Anti.Row justify="center" width="full">
          <Anti.Text>Center Justified Row</Anti.Text>
        </Anti.Row>
        <Anti.Row justify="end" width="full">
          <Anti.Text>End Justified Row</Anti.Text>
        </Anti.Row>
        <Anti.Row justify="space-between" width="full">
          <Anti.Text>Space</Anti.Text>
          <Anti.Text>Between</Anti.Text>
          <Anti.Text>Row</Anti.Text>
        </Anti.Row>
        <Anti.Row justify="space-around" width="full">
          <Anti.Text>Space</Anti.Text>
          <Anti.Text>Around</Anti.Text>
          <Anti.Text>Row</Anti.Text>
        </Anti.Row>
        <Anti.Row spacing="small" width="full">
          <Anti.Text>Small</Anti.Text>
          <Anti.Text>Spacing</Anti.Text>
          <Anti.Text>Row</Anti.Text>
        </Anti.Row>
        <Anti.Row spacing="medium">
          <Anti.Text>Medium</Anti.Text>
          <Anti.Text>Spacing</Anti.Text>
          <Anti.Text>Row</Anti.Text>
        </Anti.Row>

        <Anti.Row spacing="large">
          <Anti.Text>Large</Anti.Text>
          <Anti.Text>Spacing</Anti.Text>
          <Anti.Text>Row</Anti.Text>
        </Anti.Row>

        <Anti.Row padding="none">
          <Anti.Text>No Padding Row</Anti.Text>
        </Anti.Row>
        <Anti.Row padding="small">
          <Anti.Text>Small Padding Row</Anti.Text>
        </Anti.Row>
        <Anti.Row padding="medium">
          <Anti.Text>Medium Padding Row</Anti.Text>
        </Anti.Row>
        <Anti.Row padding="large">
          <Anti.Text>Large Padding Row</Anti.Text>
        </Anti.Row>

        <Anti.Column padding="small">
          <Anti.Row type="side-border">
            <Anti.Text>Side Border Row</Anti.Text>
          </Anti.Row>
          <Anti.Row type="side-border-reverse">
            <Anti.Text>Reverse Side Border Row</Anti.Text>
          </Anti.Row>
          <Anti.Row type="border">
            <Anti.Text>Bordered Row</Anti.Text>
          </Anti.Row>
        </Anti.Column>

        <Anti.Row highlighted>
          <Anti.Text>Highlighted Row</Anti.Text>
        </Anti.Row>

        <Anti.Row width="full" justify="space-between">
          <Anti.Text>Full Width Row</Anti.Text>
          <Anti.Text>→</Anti.Text>
        </Anti.Row>

        <Anti.Row clickAction="antispace:open_external_url:https://google.com">
          <Anti.Text>Clickable Row</Anti.Text>
        </Anti.Row>

        <Anti.Divider />
        <Anti.Text type="heading2">Rows</Anti.Text>

        <Anti.Column width="full">
          <Anti.Text>Default Column</Anti.Text>
        </Anti.Column>
        <Anti.Column align="center" width="full">
          <Anti.Text>Center Aligned Column</Anti.Text>
        </Anti.Column>
        <Anti.Column align="right" width="full">
          <Anti.Text>Right Aligned Column</Anti.Text>
        </Anti.Column>

        <Anti.Column justify="center">
          <Anti.Text>Center Justified Column</Anti.Text>
        </Anti.Column>
        <Anti.Column justify="end">
          <Anti.Text>End Justified Column</Anti.Text>
        </Anti.Column>
        <Anti.Column justify="space-between">
          <Anti.Text>Space</Anti.Text>
          <Anti.Text>Between</Anti.Text>
          <Anti.Text>Column</Anti.Text>
        </Anti.Column>
        <Anti.Column justify="space-around">
          <Anti.Text>Space</Anti.Text>
          <Anti.Text>Around</Anti.Text>
          <Anti.Text>Column</Anti.Text>
        </Anti.Column>
        <Anti.Column spacing="small" width="full">
          <Anti.Text>Small</Anti.Text>
          <Anti.Text>Spacing</Anti.Text>
          <Anti.Text>Column</Anti.Text>
        </Anti.Column>
        <Anti.Column spacing="medium">
          <Anti.Text>Medium</Anti.Text>
          <Anti.Text>Spacing</Anti.Text>
          <Anti.Text>Column</Anti.Text>
        </Anti.Column>
        <Anti.Column spacing="large">
          <Anti.Text>Large</Anti.Text>
          <Anti.Text>Spacing</Anti.Text>
          <Anti.Text>Column</Anti.Text>
        </Anti.Column>

        <Anti.Column padding="none">
          <Anti.Text>No Padding Column</Anti.Text>
        </Anti.Column>
        <Anti.Column padding="small">
          <Anti.Text>Small Padding Column</Anti.Text>
        </Anti.Column>
        <Anti.Column padding="medium">
          <Anti.Text>Medium Padding Column</Anti.Text>
        </Anti.Column>
        <Anti.Column padding="large">
          <Anti.Text>Large Padding Column</Anti.Text>
        </Anti.Column>

        <Anti.Column type="border">
          <Anti.Text>Bordered Column</Anti.Text>
        </Anti.Column>
        <Anti.Column highlighted>
          <Anti.Text>Highlighted Column</Anti.Text>
        </Anti.Column>

        <Anti.Column width="full">
          <Anti.Text>Full Width Column</Anti.Text>
        </Anti.Column>

        <Anti.Divider />
        <Anti.Text type="heading2">Typography</Anti.Text>

        <Anti.Text type="heading1">Heading 1</Anti.Text>
        <Anti.Text type="heading2">Heading 2</Anti.Text>
        <Anti.Text type="subheading">Subheading</Anti.Text>
        <Anti.Text type="text">Default text</Anti.Text>
        <Anti.Text type="small">Small text</Anti.Text>
        <Anti.Text type="dim">Dim Text</Anti.Text>
        <Anti.Text type="negative">Negative Text</Anti.Text>
        <Anti.Text type="positive">Positive Text</Anti.Text>

        <Anti.Column width="full">
          <Anti.Text align="left">Left Aligned Text</Anti.Text>
          <Anti.Text align="center">Center Aligned Text</Anti.Text>
          <Anti.Text align="right">Right Aligned Text</Anti.Text>
        </Anti.Column>

        <Anti.Text weight="light">Light Weight Text</Anti.Text>
        <Anti.Text weight="regular">Regular Weight Text</Anti.Text>
        <Anti.Text weight="bold">Bold Weight Text</Anti.Text>

        <Anti.Text tracking="tight">Tight Tracking Text</Anti.Text>
        <Anti.Text tracking="normal">Normal Tracking Text</Anti.Text>
        <Anti.Text tracking="wide">Wide Tracking Text</Anti.Text>

        <Anti.Text type="largetype">Large Type</Anti.Text>

        <Anti.Divider />
        <Anti.Text type="heading2">Buttons</Anti.Text>

        <Anti.Row>
          <Anti.Button action="button" text="Default Button" />
          <Anti.Button action="button" type="secondary" text="Secondary Button" />
          <Anti.Button action="button" type="negative" text="Negative Button" />
        </Anti.Row>

        <Anti.Row>
          <Anti.Button action="button" size="small" text="Small Button" />
          <Anti.Button action="button" size="medium" text="Medium Button" />
          <Anti.Button action="button" size="large" text="Large Button" />
        </Anti.Row>

        <Anti.Row>
          <Anti.Button action="button" text="Custom loading text" loadingText="plz wait..." />
          <Anti.Button action="button" text="Disabled button" disabled />
        </Anti.Row>

        <Anti.Row>
          <Anti.Input name="btn-input" placeholder="Disable button when this is empty" />
          <Anti.Button action="button" text="Conditionally disabled button" disabledWhen="btn-input:empty" />
        </Anti.Row>

        <Anti.Divider />
        <Anti.Text type="heading2">Inputs</Anti.Text>

        <Anti.Input name="input-text" placeholder="Text input" />
        <Anti.Input name="input-number" type="number" placeholder="Number input" />
        <Anti.Input name="input-date" type="date" placeholder="Date input" />
        <Anti.Row width="full">
          <Anti.Input name="input-date" width="full" placeholder="Full width input" />
        </Anti.Row>

        <Anti.Input name="input-date" disabled placeholder="Disabled input" />
        <Anti.Input name="input-date" disabled placeholder="Conditionally disabled input" disabledWhen="input-text:empty" />

        <Anti.Divider />

        <Anti.Textarea name="textarea-text" placeholder="Text Area" />
        <Anti.Row width="full">
          <Anti.Textarea name="input-date" width="full" placeholder="Full width textarea" />
        </Anti.Row>

        <Anti.Textarea name="input-date" disabled placeholder="Disabled textarea" />
        <Anti.Textarea name="input-date" disabled placeholder="Conditionally disabled textarea" disabledWhen="textarea-text:empty" />

        <Anti.Divider />

        <Anti.Select name="default-select">
          <Anti.SelectOption value="value1" label="Value 1" />
          <Anti.SelectOption value="value2" label="Value 2" />
          <Anti.SelectOption value="value3" label="Value 3" />
        </Anti.Select>
        <Anti.Select name="disabled-select" disabled>
          <Anti.SelectOption value="value1" label="Disabled Select" />
        </Anti.Select>
        <Anti.Select name="Conditionally Disabled Select" disabledWhen="default-select:noteqals:value3">
          <Anti.SelectOption value="value31" label="Value 3.1" />
          <Anti.SelectOption value="value32" label="Value 3.2" />
          <Anti.SelectOption value="value33" label="Value 3.3" />
        </Anti.Select>

        <Anti.Divider />

        <Anti.Checkbox name="checkbox-1" label="Checkbox" />
        <Anti.Checkbox name="checkbox-2" label="Disabled Checkbox" disabled />
        <Anti.Checkbox name="checkbox-4" label="Conditionally Disabled Checkbox" disabledWhen="checkbox-1:checked" />

        <Anti.Divider />
        <Anti.Text type="heading2">Images</Anti.Text>

        <Anti.Row spacing="large">
          <Anti.Column align="center">
            <Anti.Image src="https://plus.unsplash.com/premium_photo-1733514691627-e62171fc052c" width={300} height={200} />
            <Anti.Text>Default Image</Anti.Text>
          </Anti.Column>
          <Anti.Column align="center">
            <Anti.Image src="https://plus.unsplash.com/premium_photo-1733514691627-e62171fc052c" width={200} height={200} rounded />
            <Anti.Text>Rounded Image</Anti.Text>
          </Anti.Column>
          <Anti.Column align="center">
            <Anti.Image src="https://plus.unsplash.com/premium_photo-1733514691627-e62171fc052c" width={200} height={200} filter="grayscale" />
            <Anti.Text>Filtered Image</Anti.Text>
          </Anti.Column>
        </Anti.Row>

        <Anti.Divider />
        <Anti.Text type="heading2">Links</Anti.Text>

        <Anti.Link href="https://google.com" text="External Link" />

        <Anti.Divider />
        <Anti.Text type="heading2">Badges</Anti.Text>

        <Anti.Row>
          <Anti.Badge text="Primary Badge" />
          <Anti.Badge text="Secondary Badge" type="secondary" />
          <Anti.Badge text="Danger Badge" type="danger" />
        </Anti.Row>
      </Anti.Column>
    ) as any,
  )
})

app.get("/manifest", async (c) => {
  const echo = {
    type: "function",
    function: {
      name: "echo",
      description: "Echo back the text provided",
      parameters: {
        type: "object",
        properties: {
          test_text: {
            type: "string",
            description: "Text that will be echoed back to the user",
          },
        },
        required: ["test_text"],
      },
    },
  }

  return c.json({
    wantsPage: true,
    wantsRefresh: true,
    hotkey: "t",
    functions: {
      echo,
    },
  })
})

app.post("/action", async (c) => {
  const body = await c.req.json()

  return c.json(body)
})

const port = 6100
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
})
