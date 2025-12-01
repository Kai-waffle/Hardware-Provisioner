import { Client } from '@notionhq/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { NotionPageData } from '@/types/provisioner';

type ResponseData = {
  success: boolean;
  message?: string;
  pageUrl?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // Check if Notion credentials are configured
  const notionApiKey = process.env.NOTION_API_KEY;
  const notionDatabaseId = process.env.NOTION_DATABASE_ID;

  if (!notionApiKey || !notionDatabaseId) {
    return res.status(500).json({
      success: false,
      error: 'Notion API credentials not configured on server',
    });
  }

  try {
    const data: NotionPageData = req.body;

    // Validate required data
    if (!data.customerName) {
      return res.status(400).json({
        success: false,
        error: 'Customer name is required',
      });
    }

    // Initialize Notion client
    const notion = new Client({ auth: notionApiKey });

    // Prepare properties for Notion page
    const properties: any = {
      'Customer Name': {
        title: [
          {
            text: {
              content: data.customerName,
            },
          },
        ],
      },
      'Total Stations': {
        number: data.stations.length,
      },
      'POS iPads': {
        number: data.stations.filter((s) => s.hasPOS).length,
      },
      'CDS iPads': {
        number: data.stations.filter((s) => s.hasCDS).length,
      },
      'Total Printers': {
        number: data.printers.length,
      },
      'Complexity': {
        select: {
          name: data.complexity.level,
        },
      },
      'Estimated Time': {
        rich_text: [
          {
            text: {
              content: data.complexity.time,
            },
          },
        ],
      },
      'Router': {
        rich_text: [
          {
            text: {
              content: data.networkEquipment.router,
            },
          },
        ],
      },
    };

    // Add optional fields
    if (data.networkEquipment.switch) {
      properties['Switch'] = {
        rich_text: [
          {
            text: {
              content: data.networkEquipment.switch,
            },
          },
        ],
      };
    }

    if (data.peripherals) {
      properties['POS Stands'] = { number: data.peripherals.stands };
      properties['Cash Drawers'] = { number: data.peripherals.drawers };
      properties['Card Readers'] = { number: data.peripherals.readers };
    }

    // Create the page in Notion
    const response = await notion.pages.create({
      parent: {
        database_id: notionDatabaseId,
      },
      properties,
      children: [
        {
          object: 'block',
          type: 'heading_2',
          heading_2: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: 'Order Details',
                },
              },
            ],
          },
        },
        {
          object: 'block',
          type: 'code',
          code: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: data.orderText,
                },
              },
            ],
            language: 'plain text',
          },
        },
      ],
    });

    // Return success with page URL
    return res.status(200).json({
      success: true,
      message: 'Order created successfully in Notion',
      pageUrl: (response as any).url,
    });
  } catch (error: any) {
    console.error('Notion API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to create order in Notion',
    });
  }
}
